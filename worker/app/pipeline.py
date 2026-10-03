import logging
import shutil
import tempfile
from contextlib import contextmanager
from pathlib import Path

from . import analysis, blocks, clips, config, db, highlights, media, render, selection, signals, storage, transcribe, twitch
from .media import MediaError

log = logging.getLogger(__name__)

PROCESS_STATUSES = {"QUEUED", "INGESTING", "INGESTED", "ANALYZING"}


def run(job_name: str, project_id: str) -> None:
    project = db.get_project(project_id)
    if project is None:
        log.info("Project %s no longer exists", project_id)
        return

    if job_name == "process" and project["status"] in PROCESS_STATUSES:
        step = process
    elif job_name == "render" and project["status"] == "RENDERING":
        step = render_project
    else:
        # Duplicate or stale job.
        log.info("Skipping %s for project %s in status %s", job_name, project_id, project["status"])
        return

    db.update_project(project_id, lastJob=job_name, error=None, errorParams=None)
    try:
        step(project_id, project)
    except MediaError as error:
        log.warning("%s failed for project %s: %s (%s)", job_name, project_id, error.code, error)
        db.update_project(project_id, status="FAILED", error=error.code, errorParams=error.params, stage=None)
    except Exception:
        log.exception("%s failed for project %s", job_name, project_id)
        db.update_project(project_id, status="FAILED", error="internal", errorParams=None, stage=None)
        raise


@contextmanager
def _work_dir(project_id: str):
    config.WORK_DIR.mkdir(parents=True, exist_ok=True)
    path = Path(tempfile.mkdtemp(prefix=f"{project_id}-", dir=config.WORK_DIR))
    try:
        yield path
    finally:
        shutil.rmtree(path, ignore_errors=True)


def process(project_id: str, project: dict) -> None:
    # Each stage persists its result, so a retry resumes where it failed.
    if not project.get("audioKey"):
        db.update_project(project_id, status="INGESTING", progress=0.0)
        ingest(project_id, project)
        project = db.get_project(project_id)
    db.update_project(project_id, status="ANALYZING", progress=0.0)
    analyze(project_id, project)


def ingest(project_id: str, project: dict) -> None:
    """Brings the source into storage and derives what later stages need:
    media metadata, a speech-ready audio track and, for Twitch, the chat."""
    progress = db.ProgressReporter(project_id)
    prefix = f"projects/{project_id}"

    with _work_dir(project_id) as work:
        fields: dict = {}

        if project["sourceType"] == "TWITCH":
            local = twitch.download_vod(
                project["sourceUrl"], work, progress.step("download_vod", 0.0, 0.55)
            )
            source = str(local)
            info = media.probe(source)

            chat_path = work / "chat.jsonl"
            try:
                count = twitch.download_chat(
                    project["sourceUrl"],
                    chat_path,
                    info.duration_sec,
                    progress.step("download_chat", 0.55, 0.65),
                )
                if count > 0:
                    storage.upload_file(chat_path, f"{prefix}/chat.jsonl", "application/x-ndjson")
                    fields["chatKey"] = f"{prefix}/chat.jsonl"
            except Exception:
                log.warning("Chat download failed for %s", project_id, exc_info=True)

            source_key = f"{prefix}/source{local.suffix}"
            storage.upload_file(
                local, source_key, "video/mp4", progress.step("archive_vod", 0.65, 0.8)
            )
            fields.update(sourceKey=source_key, sourceSize=float(local.stat().st_size))
            # The VOD now lives in storage: drop the local copy right away and
            # read from storage, so the file only exists twice during the
            # upload (a long VOD weighs over 10 GB).
            local.unlink()
            source = storage.presigned_get(source_key)
            audio_start = 0.8
        else:
            progress.step("probe", 0.0, 0.02)
            source = storage.presigned_get(project["sourceKey"])
            info = media.probe(source)
            audio_start = 0.02

        if not info.has_audio:
            raise MediaError("no_audio")

        audio_path = work / "audio.m4a"
        media.extract_audio(
            source, audio_path, info.duration_sec,
            progress.step("extract_audio", audio_start, 0.97),
        )
        storage.upload_file(audio_path, f"{prefix}/audio.m4a", "audio/mp4")

        db.update_project(
            project_id,
            **fields,
            audioKey=f"{prefix}/audio.m4a",
            durationSec=info.duration_sec,
            width=info.width,
            height=info.height,
            fps=info.fps,
        )


def analyze(project_id: str, project: dict) -> None:
    progress = db.ProgressReporter(project_id)
    prefix = f"projects/{project_id}"
    duration = project["durationSec"]

    with _work_dir(project_id) as work:
        audio_path = work / "audio.m4a"
        storage.download_file(project["audioKey"], audio_path)
        chat_path = None
        if project.get("chatKey"):
            chat_path = work / "chat.jsonl"
            storage.download_file(project["chatKey"], chat_path)

        if project.get("transcriptKey"):
            transcript = storage.get_json(project["transcriptKey"])
        else:
            transcript = transcribe.transcribe(
                audio_path, duration, progress.step("transcribe", 0.02, 0.85)
            )
            storage.put_json(f"{prefix}/transcript.json", transcript)
            db.update_project(project_id, transcriptKey=f"{prefix}/transcript.json")

        progress.step("signals", 0.85, 0.9)
        sig = signals.compute(audio_path, chat_path, duration)

    words = transcript["words"]
    if not words:
        raise MediaError("no_speech")

    block_list = blocks.build(words, duration)
    blocks.attach_signals(block_list, sig)
    storage.put_json(
        f"{prefix}/signals.json",
        {name: [round(float(v), 2) for v in sig[name]] for name in ("loudness", "chat", "reactions")},
    )

    progress.step("highlights", 0.9, 0.95)
    sequences = analysis.analyze(block_list, sig["has_chat"])
    chosen = highlights.pick(
        sequences, block_list, duration, retitle=config.ANALYSIS_PROVIDER == "heuristic"
    )

    # Plain Python types: numpy scalars from the signal maths can't be stored
    # in MongoDB.
    moments = [
        {
            "id": f"h{i}",
            "start": round(float(block_list[h.first_block].start), 3),
            "end": round(float(block_list[h.last_block].end), 3),
            "title": str(h.title),
            "summary": str(h.summary),
            "category": str(h.category),
            "score": float(h.score),
        }
        for i, h in enumerate(chosen)
    ]
    # Each highlight gets a little breathing room inside the surrounding pauses.
    intervals = clips.safe_intervals(words, duration)
    clips.initial_bounds(moments, intervals, duration)
    storage.put_json(f"{prefix}/cutpoints.json", intervals)

    thumbs_progress = progress.step("thumbnails", 0.95, 1.0)
    source = storage.presigned_get(project["sourceKey"])
    with _work_dir(project_id) as work:
        for index, m in enumerate(moments):
            thumbs_progress(index / len(moments))
            thumb = work / f"{m['id']}.jpg"
            try:
                media.thumbnail(source, (m["clipStart"] + m["clipEnd"]) / 2, thumb)
                storage.upload_file(thumb, f"{prefix}/thumbs/{m['id']}.jpg", "image/jpeg")
                m["thumbKey"] = f"{prefix}/thumbs/{m['id']}.jpg"
            except Exception:
                log.warning("Thumbnail failed for %s %s", project_id, m["id"], exc_info=True)

    db.update_project(
        project_id,
        signalsKey=f"{prefix}/signals.json",
        cutpointsKey=f"{prefix}/cutpoints.json",
        moments=moments,
        # The user builds the montage from the highlights in the editor.
        montage=[],
        status="REVIEW",
        stage=None,
        progress=1.0,
    )


def render_project(project_id: str, project: dict) -> None:
    progress = db.ProgressReporter(project_id)
    prefix = f"projects/{project_id}"

    moments_by_id = {m["id"]: m for m in project["moments"]}
    ordered = [moments_by_id[i] for i in project.get("montage", []) if i in moments_by_id]
    if not ordered:
        raise MediaError("montage_empty")

    cuts = selection.cuts_from_montage(ordered)
    source = storage.presigned_get(project["sourceKey"])
    storage.delete_prefix(f"{prefix}/output/")
    with _work_dir(project_id) as work:
        local = work / "montage.mp4"
        duration = render.render(
            source, cuts, project.get("fps"), work, local,
            progress.step("render", 0.0, 0.95),
        )
        key = f"{prefix}/output/montage.mp4"
        storage.upload_file(local, key, "video/mp4", progress.step("upload_output", 0.95, 1.0))
        output = {
            "key": key,
            "durationSec": round(duration, 2),
            "size": float(local.stat().st_size),
            "chapters": selection.chapters(cuts, moments_by_id),
        }

    db.update_project(project_id, outputs=[output], status="DONE", stage=None, progress=1.0)
