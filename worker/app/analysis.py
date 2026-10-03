"""Splits the stream into sequences and judges each one.

Three providers, chosen by ANALYSIS_PROVIDER:
- heuristic (default, free): scores from signals, see heuristic.py.
- ollama (free, local LLM): the model reads the transcript window by window.
- claude (paid API): reads the whole stream at once, best judgement.

The LLM providers see every block with its timestamps, transcript and signal
scores, and return a partition of the stream into titled, scored sequences.
Picking which sequences make the final cut is deterministic (selection.py),
so the user can re-select without another analysis."""

import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor
import urllib.error
import urllib.request

import anthropic

from . import config, heuristic
from .blocks import Block, Sequence
from .media import MediaError

log = logging.getLogger(__name__)

CATEGORIES = [
    "humour", "action", "exploit", "echec", "reaction", "histoire",
    "discussion", "interaction_chat", "gameplay", "temps_mort",
]

# One Claude request covers up to this much transcript (~100k tokens); a
# typical 4-6 h stream fits in one, which keeps the story coherent end to end.
_CLAUDE_MAX_CHARS = 400_000
# Small local models have small context windows: ~8k tokens of transcript
# per request, i.e. roughly 20-30 minutes of stream.
_OLLAMA_MAX_CHARS = 24_000
_OLLAMA_CONTEXT_TOKENS = 16384

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(max_retries=4)
    return _client

_SYSTEM = """You are a senior video editor who cuts Twitch stream VODs into YouTube videos.

You receive the full transcript of a stream, split into numbered blocks. Each block line reads:
#<id> [<start>-<end>] chat=<z> reactions=<z> volume=<z> | <what the streamer says>
- chat: how busy chat was (robust z-score; 0 = typical, >2 = spike).
- reactions: chat laughing / hyped / shocked (emotes like KEKW, "mdr", "???").
- volume: how loud the streamer's audio was (shouting, laughing, intense game audio).
- "(no speech)" blocks are stretches with no talking: gameplay, music, AFK or a pause screen.

Split the stream into consecutive sequences. Every block must belong to exactly one sequence, in order, with no gaps or overlaps. A sequence is a unit a viewer would perceive as one moment or scene: a fight, a joke and its payoff, a story, a discussion topic, a menu/loading stretch. Keep most sequences between 20 seconds and 4 minutes; split longer stretches at natural breaks.

For each sequence give:
- title: short and punchy, like a YouTube chapter, in the language spoken on stream.
- summary: one sentence on what happens, same language.
- category: the best fit.
- score: 0-10, how much it deserves a place in an edited video. 0-1: dead time (AFK, pause screen, waiting, loading, setup, reading donations nobody cares about, long silence). 2-4: filler that only makes sense in a full chronological cut. 5-6: solid content. 7-8: strong moment. 9-10: the stream's best moments.
- standalone: true if it works out of context in a best-of (the setup is inside the sequence).

Use the signals as evidence, not as the answer: chat spikes and loud audio often mark highlights, but a quiet, well-told story can score high and a loud menu screen can score low. Judge from what is actually said. Keep the setup of a payoff in the same sequence, so a cut never starts right after the context it needs."""

_SCHEMA = {
    "type": "object",
    "properties": {
        "sequences": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "first_block": {"type": "integer"},
                    "last_block": {"type": "integer"},
                    "title": {"type": "string"},
                    "summary": {"type": "string"},
                    "category": {"type": "string", "enum": CATEGORIES},
                    "score": {"type": "integer"},
                    "standalone": {"type": "boolean"},
                },
                "required": [
                    "first_block", "last_block", "title", "summary",
                    "category", "score", "standalone",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["sequences"],
    "additionalProperties": False,
}


def _timestamp(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}"


def _block_line(block: Block) -> str:
    text = block.text if block.is_speech else "(no speech)"
    return (
        f"#{block.id} [{_timestamp(block.start)}-{_timestamp(block.end)}] "
        f"chat={block.chat:+.1f} reactions={block.reactions:+.1f} volume={block.loudness:+.1f} | {text}"
    )


def _windows(blocks: list[Block], max_chars: int) -> list[list[Block]]:
    windows, current, size = [], [], 0
    for block in blocks:
        line = len(_block_line(block))
        if current and size + line > max_chars:
            windows.append(current)
            current, size = [], 0
        current.append(block)
        size += line
    if current:
        windows.append(current)
    return windows


def _prompt(window: list[Block], context: str) -> str:
    lines = "\n".join(_block_line(b) for b in window)
    return (
        f"{context}\n\nBlocks #{window[0].id} to #{window[-1].id}:\n\n{lines}\n\n"
        f"Return the sequences covering blocks #{window[0].id} to #{window[-1].id}."
    )


def _claude_window(window: list[Block], context: str) -> list[Sequence]:
    prompt = _prompt(window, context)
    with _get_client().beta.messages.stream(
        model=config.ANTHROPIC_MODEL,
        max_tokens=64000,
        system=_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
        output_config={"effort": "high", "format": {"type": "json_schema", "schema": _SCHEMA}},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    ) as stream:
        response = stream.get_final_message()

    log.info("Claude usage for blocks %s-%s: %s", window[0].id, window[-1].id, response.usage)
    if response.stop_reason == "refusal":
        raise RuntimeError(f"Claude declined the analysis: {response.stop_details}")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("Claude's analysis was cut off (max_tokens)")

    text = next(b.text for b in response.content if b.type == "text")
    return [Sequence(**item) for item in json.loads(text)["sequences"]]


def _ollama_window(window: list[Block], context: str) -> list[Sequence]:
    body = json.dumps(
        {
            "model": config.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": _SYSTEM},
                {"role": "user", "content": _prompt(window, context)},
            ],
            "format": _SCHEMA,
            "stream": False,
            "options": {"num_ctx": _OLLAMA_CONTEXT_TOKENS, "temperature": 0.2},
        }
    ).encode()
    request = urllib.request.Request(
        f"{config.OLLAMA_URL}/api/chat", data=body, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(request, timeout=1800) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")[:300]
        if error.code == 404:
            raise MediaError("analysis_unavailable", f"Ollama model {config.OLLAMA_MODEL} not found: ollama pull {config.OLLAMA_MODEL}") from error
        raise RuntimeError(f"Ollama HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise MediaError("analysis_unavailable", f"Ollama unreachable at {config.OLLAMA_URL}") from error

    items = json.loads(payload["message"]["content"]).get("sequences", [])
    sequences = []
    for item in items:
        try:
            sequences.append(Sequence(**item))
        except TypeError:
            log.warning("Ignoring malformed sequence from Ollama: %s", item)
    return sequences


def _normalize(sequences: list[Sequence], blocks: list[Block]) -> list[Sequence]:
    """Turns the model's answer into a clean partition: sorted, clamped, no
    overlaps, and any block it skipped absorbed into the previous sequence."""
    last_id = len(blocks) - 1
    cleaned: list[Sequence] = []
    next_block = 0
    for seq in sorted(sequences, key=lambda s: s.first_block):
        first = max(seq.first_block, next_block)
        last = min(seq.last_block, last_id)
        if last < first:
            continue
        if cleaned and first > next_block:
            cleaned[-1].last_block = first - 1
        elif not cleaned and first > 0:
            first = 0
        seq.first_block, seq.last_block = first, last
        seq.score = float(min(max(seq.score, 0), 10))
        cleaned.append(seq)
        next_block = last + 1
    if not cleaned:
        raise RuntimeError("The analysis returned no usable sequences")
    cleaned[-1].last_block = last_id
    return cleaned


def analyze(blocks: list[Block], has_chat: bool) -> list[Sequence]:
    provider = config.ANALYSIS_PROVIDER
    if provider == "heuristic":
        return _normalize(heuristic.analyze(blocks, has_chat), blocks)

    goal = "The editor will pick the strongest sequences as highlights for a best-of."
    context = goal + ("" if has_chat else " Chat data is unavailable for this stream: chat and reactions are 0.")

    if provider == "ollama":
        # One window at a time: a local model can't serve parallel requests faster.
        results = [_ollama_window(w, context) for w in _windows(blocks, _OLLAMA_MAX_CHARS)]
        return _normalize([s for r in results for s in r], blocks)

    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        raise MediaError("analysis_unavailable", "ANTHROPIC_API_KEY is not set")
    try:
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(
                pool.map(lambda w: _claude_window(w, context), _windows(blocks, _CLAUDE_MAX_CHARS))
            )
    except anthropic.AuthenticationError as error:
        raise MediaError("analysis_unavailable", "Invalid Anthropic credentials") from error
    return _normalize([s for r in results for s in r], blocks)
