"""GPU transcription service for the worker.

Runs outside Docker so it can use the GPU: Metal on Apple Silicon (through
MLX), CUDA on a Linux server (through faster-whisper). The worker sends raw
audio chunks and gets words back with their timings; when this service isn't
running, the worker falls back to CPU transcription inside Docker.

  POST /transcribe?language=fr   body: float32 mono PCM at 16 kHz
  -> {"words": [[start, end, text], ...]}
  GET /health                    -> {"backend": "...", "model": "..."}
"""

import json
import logging
import os
import platform
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("transcriber")

HOST = os.environ.get("TRANSCRIBER_HOST", "0.0.0.0")
PORT = int(os.environ.get("TRANSCRIBER_PORT", "8765"))
SAMPLE_RATE = 16000
APPLE_SILICON = platform.system() == "Darwin" and platform.machine() == "arm64"

# Defaults sized for the hardware: an 8 GB Mac can't hold large-v3-turbo next
# to Docker, a CUDA GPU runs it faster than the CPU runs "small".
MODEL = os.environ.get(
    "TRANSCRIBER_MODEL",
    "mlx-community/whisper-small-mlx" if APPLE_SILICON else "large-v3-turbo",
)


class MlxBackend:
    name = "mlx"

    def transcribe(self, audio: np.ndarray, language: str | None) -> list:
        import mlx_whisper

        result = mlx_whisper.transcribe(
            audio,
            path_or_hf_repo=MODEL,
            language=language,
            word_timestamps=True,
            # Independent windows: one misheard sentence can't derail the rest.
            condition_on_previous_text=False,
            # Skips long silences (gameplay, music) instead of hallucinating text.
            hallucination_silence_threshold=2.0,
        )
        return [
            [round(w["start"], 3), round(w["end"], 3), w["word"]]
            for segment in result["segments"]
            for w in segment.get("words", [])
        ]


class FasterWhisperBackend:
    name = "faster-whisper"

    def __init__(self):
        from faster_whisper import WhisperModel

        device = os.environ.get("TRANSCRIBER_DEVICE", "cuda")
        compute = "float16" if device == "cuda" else "int8"
        self.model = WhisperModel(MODEL, device=device, compute_type=compute)

    def transcribe(self, audio: np.ndarray, language: str | None) -> list:
        segments, _ = self.model.transcribe(
            audio, language=language, word_timestamps=True, vad_filter=True, beam_size=1
        )
        return [
            [round(w.start, 3), round(w.end, 3), w.word]
            for segment in segments
            for w in segment.words or []
        ]


backend = MlxBackend() if APPLE_SILICON else FasterWhisperBackend()
# One GPU, one job at a time: concurrent requests would only fight for it.
gpu_lock = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self._json(200, {"backend": backend.name, "model": MODEL})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        url = urlparse(self.path)
        if url.path != "/transcribe":
            return self._json(404, {"error": "not found"})
        length = int(self.headers.get("Content-Length", 0))
        audio = np.frombuffer(self.rfile.read(length), dtype=np.float32)
        language = parse_qs(url.query).get("language", [None])[0] or None
        try:
            with gpu_lock:
                words = backend.transcribe(audio, language)
        except Exception as error:  # reported to the worker, which logs it
            log.exception("Transcription failed")
            return self._json(500, {"error": str(error)})
        log.info("Transcribed %.0f s of audio: %d words", len(audio) / SAMPLE_RATE, len(words))
        self._json(200, {"words": words})

    def log_message(self, *args):  # keep the console for our own logs
        pass


if __name__ == "__main__":
    log.info("Transcriber on %s:%d using %s (%s)", HOST, PORT, backend.name, MODEL)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
