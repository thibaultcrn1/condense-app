"""Word-level transcription.

Returns {"words": [[start, end, text], ...]}. Each word's text carries its own
leading space (Whisper's convention), so joining them with "" rebuilds the
sentence, contractions included ("n'a", not "n 'a")."""

import json
import logging
import math
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Callable

import numpy as np

from . import config
from .media import MediaError

log = logging.getLogger(__name__)

# Audio is decoded and transcribed in chunks: 5 min keeps Whisper "small"
# around 800 MB (20 min chunks peaked at 1.4 GB and got OOM-killed in a 4 GB
# Docker VM), and lets progress move.
_CHUNK_SEC = 5 * 60
_SAMPLE_RATE = 16000

_model = None


def transcribe(audio_path: Path, duration_sec: float, on_progress: Callable[[float], None]) -> dict:
    provider = config.TRANSCRIBE_PROVIDER
    if provider == "deepgram":
        return _transcribe_deepgram(audio_path)
    if provider == "remote" or (provider == "auto" and _remote_available()):
        return _transcribe_remote(audio_path, duration_sec, on_progress)
    return _transcribe_local(audio_path, duration_sec, on_progress)


def _remote_available() -> bool:
    """The GPU service (transcriber/server.py) is optional: when it isn't
    running, transcription happens on the CPU in this container."""
    try:
        with urllib.request.urlopen(f"{config.TRANSCRIBER_URL}/health", timeout=3) as response:
            info = json.load(response)
        log.info("Using GPU transcriber: %s", info)
        return True
    except (OSError, ValueError):
        log.info("GPU transcriber not reachable at %s, transcribing on CPU", config.TRANSCRIBER_URL)
        return False


def _transcribe_remote(audio_path: Path, duration_sec: float, on_progress: Callable[[float], None]) -> dict:
    words: list = []
    total = max(duration_sec, 1.0)
    query = urllib.parse.urlencode({"language": config.WHISPER_LANGUAGE or ""})
    for index in range(math.ceil(duration_sec / _CHUNK_SEC)):
        offset = index * _CHUNK_SEC
        audio = _decode_chunk(audio_path, offset, _CHUNK_SEC)
        if audio.size == 0:
            break
        request = urllib.request.Request(
            f"{config.TRANSCRIBER_URL}/transcribe?{query}",
            data=audio.tobytes(),
            method="POST",
            headers={"Content-Type": "application/octet-stream"},
        )
        with urllib.request.urlopen(request, timeout=1800) as response:
            chunk_words = json.load(response)["words"]
        words.extend([round(offset + start, 3), round(offset + end, 3), text] for start, end, text in chunk_words)
        on_progress((offset + _CHUNK_SEC) / total)
    return {"words": words}


def _whisper():
    global _model
    if _model is None:
        # Imported lazily: heavy, and only needed for this stage.
        from faster_whisper import WhisperModel

        log.info("Loading Whisper model %s", config.WHISPER_MODEL)
        _model = WhisperModel(
            config.WHISPER_MODEL,
            device="cpu",
            compute_type="int8",
            cpu_threads=config.WHISPER_THREADS,
            download_root=str(config.WHISPER_MODEL_DIR),
        )
    return _model


def _decode_chunk(audio_path: Path, offset: float, length: float) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(offset), "-t", str(length), "-i", str(audio_path),
         "-f", "f32le", "-ac", "1", "-ar", str(_SAMPLE_RATE), "pipe:1"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def _transcribe_local(audio_path: Path, duration_sec: float, on_progress: Callable[[float], None]) -> dict:
    model = _whisper()
    words: list = []
    total = max(duration_sec, 1.0)
    for index in range(math.ceil(duration_sec / _CHUNK_SEC)):
        offset = index * _CHUNK_SEC
        audio = _decode_chunk(audio_path, offset, _CHUNK_SEC)
        if audio.size == 0:
            break
        segments, _ = model.transcribe(
            audio,
            language=config.WHISPER_LANGUAGE,
            word_timestamps=True,
            # Skips music/gameplay stretches without speech: faster, and
            # avoids Whisper hallucinating text over silence.
            vad_filter=True,
            beam_size=config.WHISPER_BEAM_SIZE,
        )
        for segment in segments:
            for w in segment.words or []:
                words.append([round(offset + w.start, 3), round(offset + w.end, 3), w.word])
            on_progress((offset + segment.end) / total)
    return {"words": words}


def _transcribe_deepgram(audio_path: Path) -> dict:
    """Paid alternative: much faster than local Whisper on CPU."""
    if not config.DEEPGRAM_API_KEY:
        raise MediaError("transcription_unavailable", "DEEPGRAM_API_KEY is not set")

    params = urllib.parse.urlencode(
        {
            "model": config.DEEPGRAM_MODEL,
            "language": config.WHISPER_LANGUAGE or "multi",
            "smart_format": "true",
            "punctuate": "true",
        }
    )
    size = audio_path.stat().st_size
    with audio_path.open("rb") as body:
        request = urllib.request.Request(
            f"https://api.deepgram.com/v1/listen?{params}",
            data=body,
            method="POST",
            headers={
                "Authorization": f"Token {config.DEEPGRAM_API_KEY}",
                "Content-Type": "audio/mp4",
                "Content-Length": str(size),
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=1200) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as error:
            detail = error.read().decode(errors="replace")[:500]
            log.error("Deepgram error %s: %s", error.code, detail)
            if error.code in (401, 403):
                raise MediaError("transcription_unavailable", "Invalid Deepgram key") from error
            raise RuntimeError(f"Deepgram HTTP {error.code}: {detail}") from error

    alternative = payload["results"]["channels"][0]["alternatives"][0]
    words = [
        [round(w["start"], 3), round(w["end"], 3), " " + (w.get("punctuated_word") or w["word"])]
        for w in alternative.get("words", [])
    ]
    return {"words": words}
