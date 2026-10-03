import json
import re
import subprocess
from pathlib import Path

import numpy as np

# Chat reacts to what happened on stream a few seconds late (stream delay +
# reading + typing). Shifting the chat curve back realigns spikes with events.
CHAT_DELAY_SEC = 6

_REACTION_EMOTES = {
    "LUL", "LULW", "KEKW", "OMEGALUL", "ICANT", "Pog", "PogChamp", "POGGERS",
    "PogU", "monkaS", "monkaW", "PepeLaugh", "Kappa", "WutFace", "NotLikeThis",
}
_REACTION_TEXT = re.compile(
    r"\b(mdr+|ptdr+|xd+|lol+|lmao|omg|wtf|gg+|pog+|kekw|sheesh|oh+|ah+|nan+)\b|[😂🤣💀😭]|\?{3,}|!{3,}",
    re.IGNORECASE,
)


def audio_loudness(audio_path: Path, duration_sec: float) -> np.ndarray:
    """RMS level in dBFS for every second of the audio. Decoded at 8 kHz:
    plenty for loudness, and keeps a 4 h stream at ~115 MB of samples."""
    rate = 8000
    process = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", str(audio_path), "-f", "s16le",
         "-ac", "1", "-ar", str(rate), "pipe:1"],
        stdout=subprocess.PIPE,
        # We may stop reading before ffmpeg is done (duration rounding);
        # its resulting broken-pipe complaint is expected.
        stderr=subprocess.DEVNULL,
    )
    assert process.stdout is not None
    seconds = int(np.ceil(duration_sec))
    levels = np.full(seconds, -90.0)
    for second in range(seconds):
        chunk = process.stdout.read(rate * 2)
        if not chunk:
            break
        samples = np.frombuffer(chunk, dtype=np.int16).astype(np.float32) / 32768
        rms = float(np.sqrt(np.mean(samples**2))) if samples.size else 0.0
        levels[second] = 20 * np.log10(max(rms, 1e-5))
    process.stdout.close()
    process.wait()
    return levels


def chat_activity(chat_path: Path | None, duration_sec: float) -> tuple[np.ndarray, np.ndarray]:
    """Messages per second and reaction messages per second, delay-corrected."""
    seconds = int(np.ceil(duration_sec))
    messages = np.zeros(seconds)
    reactions = np.zeros(seconds)
    if chat_path is None:
        return messages, reactions

    with chat_path.open(encoding="utf-8") as file:
        for line in file:
            row = json.loads(line)
            t = int(row["t"]) - CHAT_DELAY_SEC
            if not 0 <= t < seconds:
                continue
            messages[t] += 1
            if _REACTION_EMOTES.intersection(row.get("emotes") or []) or _REACTION_TEXT.search(
                row.get("text") or ""
            ):
                reactions[t] += 1
    return messages, reactions


def smooth(values: np.ndarray, window_sec: int) -> np.ndarray:
    if values.size == 0:
        return values
    kernel = np.ones(window_sec) / window_sec
    return np.convolve(values, kernel, mode="same")


def robust_z(values: np.ndarray) -> np.ndarray:
    """Z-score using median/MAD, so a handful of huge spikes (raids, hype
    trains) don't flatten everything else."""
    if values.size == 0:
        return values
    median = np.median(values)
    mad = np.median(np.abs(values - median)) * 1.4826
    if mad < 1e-6:
        std = values.std()
        if std < 1e-6:
            return np.zeros_like(values)
        mad = std
    return (values - median) / mad


def compute(audio_path: Path, chat_path: Path | None, duration_sec: float) -> dict:
    loudness = audio_loudness(audio_path, duration_sec)
    messages, reactions = chat_activity(chat_path, duration_sec)
    return {
        "loudness": robust_z(smooth(loudness, 3)),
        "chat": robust_z(smooth(messages, 10)) if messages.any() else np.zeros_like(messages),
        "reactions": robust_z(smooth(reactions, 10)) if reactions.any() else np.zeros_like(reactions),
        "has_chat": bool(messages.any()),
    }
