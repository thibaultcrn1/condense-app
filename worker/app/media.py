import json
import subprocess
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Callable


class MediaError(Exception):
    """A failure the user should see. `code` is translated by the app (see
    app.errors in the dictionaries); `params` fill its placeholders; `detail`
    is for operators and only goes to the logs."""

    def __init__(self, code: str, detail: str = "", **params):
        super().__init__(detail or code)
        self.code = code
        self.params = params


@dataclass
class ProbeResult:
    duration_sec: float
    width: int | None
    height: int | None
    fps: float | None
    has_audio: bool


# Tolerate transient storage/network hiccups when reading over HTTP.
_HTTP_INPUT_FLAGS = ["-reconnect", "1", "-reconnect_on_network_error", "1", "-reconnect_delay_max", "10"]


def input_flags(source: str) -> list[str]:
    return _HTTP_INPUT_FLAGS if source.startswith("http") else []


def probe(source: str) -> ProbeResult:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", *input_flags(source),
            "-print_format", "json", "-show_format", "-show_streams", source,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise MediaError("unreadable_file")

    data = json.loads(result.stdout)
    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    has_audio = any(s.get("codec_type") == "audio" for s in streams)

    duration = float(data.get("format", {}).get("duration") or 0)
    if video is None or duration <= 0:
        raise MediaError("no_video")

    fps = None
    rate = video.get("avg_frame_rate") or video.get("r_frame_rate")
    if rate and rate != "0/0":
        fps = float(Fraction(rate))

    return ProbeResult(
        duration_sec=duration,
        width=video.get("width"),
        height=video.get("height"),
        fps=fps,
        has_audio=has_audio,
    )


def extract_audio(
    source: str,
    output: Path,
    duration_sec: float,
    on_progress: Callable[[float], None],
) -> None:
    """Mono 16 kHz AAC: what speech-to-text APIs want, ~30 MB per hour."""
    run_ffmpeg(
        [*input_flags(source), "-i", source, "-vn", "-ac", "1", "-ar", "16000",
         "-c:a", "aac", "-b:a", "64k", str(output)],
        duration_sec,
        on_progress,
    )


def run_ffmpeg(
    args: list[str],
    duration_sec: float,
    on_progress: Callable[[float], None],
) -> None:
    process = subprocess.Popen(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-nostats",
         "-progress", "pipe:1", *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    assert process.stdout is not None
    for line in process.stdout:
        key, _, value = line.strip().partition("=")
        if key == "out_time_us" and value.isdigit() and duration_sec > 0:
            on_progress(int(value) / 1_000_000 / duration_sec)

    stderr = process.stderr.read() if process.stderr else ""
    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed: {stderr[-2000:]}")


def thumbnail(source: str, at_sec: float, output: Path, width: int = 320) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", f"{at_sec:.3f}", *input_flags(source), "-i", source,
         "-frames:v", "1", "-vf", f"scale={width}:-2", "-q:v", "5", str(output)],
        check=True,
        capture_output=True,
    )
