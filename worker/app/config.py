import os
from pathlib import Path


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing environment variable {name}")
    return value


DATABASE_URL = _require("DATABASE_URL")
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")

S3_ENDPOINT = os.environ.get("S3_ENDPOINT") or None
S3_REGION = os.environ.get("S3_REGION", "auto")
S3_BUCKET = _require("S3_BUCKET")
S3_ACCESS_KEY_ID = _require("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = _require("S3_SECRET_ACCESS_KEY")
S3_FORCE_PATH_STYLE = os.environ.get("S3_FORCE_PATH_STYLE") == "true"

WORK_DIR = Path(os.environ.get("WORK_DIR", "/tmp/work"))

# Twitch VODs are downloaded at this height at most (720 keeps ~1.5 GB/h).
TWITCH_MAX_HEIGHT = int(os.environ.get("TWITCH_MAX_HEIGHT", "720"))
# Space always left free when importing, so the database never runs dry.
MIN_FREE_DISK_BYTES = int(float(os.environ.get("MIN_FREE_DISK_GB", "5")) * 1e9)

# Must match PIPELINE_QUEUE in src/lib/queue.ts.
PIPELINE_QUEUE = "pipeline"

# Transcription: "auto" (GPU service when running, else CPU), "remote" (GPU
# service only), "local" (faster-whisper on CPU here) or "deepgram" (paid).
TRANSCRIBE_PROVIDER = os.environ.get("TRANSCRIBE_PROVIDER", "auto")
# transcriber/server.py, running on the host (Mac GPU) or a GPU server.
TRANSCRIBER_URL = os.environ.get("TRANSCRIBER_URL", "http://host.docker.internal:8765").rstrip("/")
# base: ~17x realtime on an M1, no punctuation. small: ~6x, punctuated.
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")
WHISPER_MODEL_DIR = Path(os.environ.get("WHISPER_MODEL_DIR", "/models"))
# Language spoken on stream; empty = auto-detect.
WHISPER_LANGUAGE = os.environ.get("WHISPER_LANGUAGE", "fr") or None
WHISPER_BEAM_SIZE = int(os.environ.get("WHISPER_BEAM_SIZE", "1"))
# More threads isn't faster: on an 8-core M1, 4 threads ran ~3x faster than 8.
WHISPER_THREADS = int(os.environ.get("WHISPER_THREADS", "4"))
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY")
DEEPGRAM_MODEL = os.environ.get("DEEPGRAM_MODEL", "nova-3")

# Highlight detection: "heuristic" (free, signals only), "ollama" (free,
# local LLM) or "claude" (paid API).
ANALYSIS_PROVIDER = os.environ.get("ANALYSIS_PROVIDER", "heuristic")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-opus-5-5")
