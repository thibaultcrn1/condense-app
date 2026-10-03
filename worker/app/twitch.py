import json
import logging
import re
import shutil
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Callable

import yt_dlp

from . import config
from .media import MediaError

log = logging.getLogger(__name__)


def download_vod(url: str, work_dir: Path, on_progress: Callable[[float], None]) -> Path:
    def hook(status: dict) -> None:
        if status.get("status") != "downloading":
            return
        total = status.get("total_bytes") or status.get("total_bytes_estimate")
        if total:
            on_progress(status.get("downloaded_bytes", 0) / total)
        elif status.get("fragment_count"):
            on_progress(status.get("fragment_index", 0) / status["fragment_count"])

    options = {
        # Capped quality: source 1080p60 weighs ~3-6 GB per hour of stream,
        # 720p about a third of that, plenty for a YouTube best-of.
        "format": f"best[height<={config.TWITCH_MAX_HEIGHT}]/worst",
        "outtmpl": str(work_dir / "source.%(ext)s"),
        "merge_output_format": "mp4",
        "concurrent_fragment_downloads": 8,
        "progress_hooks": [hook],
        "quiet": True,
        "noprogress": True,
    }
    try:
        with yt_dlp.YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=False)
            _check_disk_space(info, work_dir)
            info = ydl.process_ie_result(info, download=True)
            return Path(ydl.prepare_filename(info))
    except yt_dlp.utils.DownloadError as error:
        log.warning("Twitch download failed: %s", error)
        if "subscriber-only" in str(error):
            raise MediaError("vod_sub_only") from error
        raise MediaError("vod_unavailable", str(error)) from error


def _check_disk_space(info: dict, work_dir: Path) -> None:
    """Fails early with a clear message rather than filling the disk halfway
    through a multi-GB download. The file is stored twice for a moment (local
    copy + object storage when both share a disk), hence the margin."""
    size = info.get("filesize") or info.get("filesize_approx")
    if not size and info.get("tbr") and info.get("duration"):
        size = info["tbr"] * 1000 / 8 * info["duration"]
    if not size:
        return
    needed = size * 2 + config.MIN_FREE_DISK_BYTES
    free = shutil.disk_usage(work_dir).free
    if free < needed:
        raise MediaError("disk_space", needed=round(needed / 1e9), free=round(free / 1e9))


# Twitch's own web client id and persisted query, as used by twitch.tv's VOD
# chat replay. Cursor pagination is blocked by an integrity check, but paging
# by contentOffsetSeconds is not.
_GQL_URL = "https://gql.twitch.tv/gql"
_GQL_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko"
_COMMENTS_QUERY_HASH = "b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a"
_CHUNK_SEC = 20 * 60


def _fetch_comments(video_id: str, offset: int) -> list[dict]:
    body = json.dumps(
        [
            {
                "operationName": "VideoCommentsByOffsetOrCursor",
                "variables": {"videoID": video_id, "contentOffsetSeconds": offset},
                "extensions": {
                    "persistedQuery": {"version": 1, "sha256Hash": _COMMENTS_QUERY_HASH}
                },
            }
        ]
    ).encode()
    request = urllib.request.Request(
        _GQL_URL,
        data=body,
        headers={"Client-Id": _GQL_CLIENT_ID, "Content-Type": "application/json"},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = json.load(response)[0]
            break
        except (urllib.error.URLError, TimeoutError):
            if attempt == 3:
                raise
            time.sleep(2**attempt)
    comments = ((payload.get("data") or {}).get("video") or {}).get("comments")
    if comments is None:
        raise RuntimeError(f"Twitch GQL error: {payload.get('errors')}")
    return [edge["node"] for edge in comments["edges"]]


def _download_range(video_id: str, start: int, end: int, on_advance: Callable[[int], None]) -> list[dict]:
    """Pages through [start, end). A page holds ~60 messages from `offset`
    onward, so the next page starts at the last message's second; ids dedupe
    the overlap, and a page stuck on one busy second moves on by one."""
    messages: dict[str, dict] = {}
    offset = start
    while offset < end:
        nodes = _fetch_comments(video_id, offset)
        if not nodes:
            break
        for node in nodes:
            if start <= node["contentOffsetSeconds"] < end:
                messages[node["id"]] = node
        last = nodes[-1]["contentOffsetSeconds"]
        on_advance(max(last, offset) - offset)
        offset = last if last > offset else offset + 1
    return list(messages.values())


def _to_record(node: dict) -> dict:
    fragments = (node.get("message") or {}).get("fragments") or []
    return {
        "t": node["contentOffsetSeconds"],
        "author": (node.get("commenter") or {}).get("login"),
        "text": "".join(f.get("text") or "" for f in fragments),
        "emotes": [f["text"] for f in fragments if f.get("emote") and f.get("text")],
    }


def download_chat(
    url: str,
    output: Path,
    duration_sec: float,
    on_progress: Callable[[float], None],
) -> int:
    """Writes the chat replay as JSONL ({t, author, text, emotes}) sorted by
    time and returns the message count. Chat density and emote spikes are the
    strongest highlight signal we have, but a VOD without chat is still usable."""
    match = re.search(r"/videos/(\d+)", url)
    if not match:
        raise ValueError(f"Not a Twitch VOD url: {url}")
    video_id = match.group(1)

    total = max(int(duration_sec), 1)
    covered = 0
    lock = threading.Lock()

    def on_advance(seconds: int) -> None:
        nonlocal covered
        with lock:
            covered += seconds
            on_progress(covered / total)

    ranges = [(s, min(s + _CHUNK_SEC, total + 1)) for s in range(0, total + 1, _CHUNK_SEC)]
    with ThreadPoolExecutor(max_workers=6) as pool:
        chunks = pool.map(lambda r: _download_range(video_id, r[0], r[1], on_advance), ranges)
        nodes = [node for chunk in chunks for node in chunk]

    nodes.sort(key=lambda n: n["contentOffsetSeconds"])
    with output.open("w", encoding="utf-8") as file:
        for node in nodes:
            file.write(json.dumps(_to_record(node), ensure_ascii=False) + "\n")
    return len(nodes)
