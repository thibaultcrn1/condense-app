"""Assembles cuts into a finished video with ffmpeg.

Each cut is re-encoded on its own (frame-accurate, independent of source
keyframes) with a few milliseconds of audio fade at both ends so joins never
click. The parts are then concatenated without re-encoding the video, and the
audio of the whole is normalised to YouTube's loudness target in one pass."""

from pathlib import Path
from typing import Callable

from .media import input_flags, run_ffmpeg
from .selection import Cut

_FADE_IN = 0.03
_FADE_OUT = 0.06
# YouTube normalises to about -14 LUFS; delivering at that level means our
# mix isn't turned down or pumped by the platform.
_LOUDNORM = "loudnorm=I=-14:TP=-1.5:LRA=11"


def render(
    source: str,
    cuts: list[Cut],
    fps: float | None,
    work: Path,
    output: Path,
    on_progress: Callable[[float], None],
) -> float:
    total = sum(c.end - c.start for c in cuts)
    done = 0.0
    parts: list[Path] = []
    rate = ["-r", f"{fps:.3f}", "-fps_mode", "cfr"] if fps else []

    for i, cut in enumerate(cuts):
        duration = cut.end - cut.start
        part = work / f"part-{i:04d}.mkv"
        fade_out_start = max(0.0, duration - _FADE_OUT)

        def part_progress(fraction: float, base=done, length=duration) -> None:
            on_progress(0.9 * (base + fraction * length) / total)

        run_ffmpeg(
            [
                # -ss before -i seeks fast; since we re-encode, the cut is
                # still frame-accurate.
                "-ss", f"{cut.start:.3f}", *input_flags(source), "-i", source,
                "-t", f"{duration:.3f}",
                "-map", "0:v:0", "-map", "0:a:0",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                "-pix_fmt", "yuv420p", *rate,
                "-af", f"afade=t=in:d={_FADE_IN},afade=t=out:st={fade_out_start:.3f}:d={_FADE_OUT}",
                "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2",
                str(part),
            ],
            duration,
            part_progress,
        )
        parts.append(part)
        done += duration

    concat_list = work / "parts.txt"
    concat_list.write_text("".join(f"file '{p.name}'\n" for p in parts))
    run_ffmpeg(
        [
            "-f", "concat", "-safe", "0", "-i", str(concat_list),
            "-c:v", "copy",
            "-af", _LOUDNORM, "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-movflags", "+faststart",
            str(output),
        ],
        total,
        lambda f: on_progress(0.9 + 0.1 * f),
    )
    for part in parts:
        part.unlink(missing_ok=True)
    return total
