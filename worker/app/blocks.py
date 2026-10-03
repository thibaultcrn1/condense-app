"""Splits the transcript into short blocks the LLM can reference by id.

Blocks break on pauses in speech, so any block boundary is a clean place to
cut: nobody is mid-sentence there."""

from dataclasses import dataclass

import numpy as np

_SENTENCE_END = (".", "?", "!", "…")
_SENTENCE_GAP = 0.7
_BLOCK_GAP = 2.0
_MAX_BLOCK = 60.0
_SILENCE_MIN = 8.0
_SILENCE_CHUNK = 60.0


@dataclass
class Sequence:
    """A run of consecutive blocks judged as one moment."""

    first_block: int
    last_block: int
    title: str
    summary: str
    category: str
    score: float
    standalone: bool


@dataclass
class Block:
    id: int
    start: float
    end: float
    text: str
    # Index range into the transcript's word list; empty for silent blocks.
    first_word: int
    last_word: int
    loudness: float = 0.0
    chat: float = 0.0
    reactions: float = 0.0

    @property
    def is_speech(self) -> bool:
        return self.last_word >= self.first_word


def _sentences(words: list) -> list[tuple[int, int]]:
    sentences = []
    start = 0
    for i, (_, end, text) in enumerate(words):
        last = i == len(words) - 1
        gap = words[i + 1][0] - end if not last else 0
        if last or text.rstrip().endswith(_SENTENCE_END) or gap > _SENTENCE_GAP:
            sentences.append((start, i))
            start = i + 1
    return sentences


def build(words: list, duration_sec: float) -> list[Block]:
    spans: list[tuple[float, float, int, int]] = []  # start, end, first_word, last_word

    current: list[int] | None = None
    for first, last in _sentences(words):
        start, end = words[first][0], words[last][1]
        if current is not None:
            gap = start - words[current[1]][1]
            length = end - words[current[0]][0]
            if gap < _BLOCK_GAP and length <= _MAX_BLOCK:
                current[1] = last
                continue
            spans.append((words[current[0]][0], words[current[1]][1], current[0], current[1]))
        current = [first, last]
    if current is not None:
        spans.append((words[current[0]][0], words[current[1]][1], current[0], current[1]))

    # Long stretches without speech (gameplay, music, AFK) become their own
    # blocks so the LLM can keep or drop them like anything else.
    filled: list[tuple[float, float, int, int]] = []
    cursor = 0.0
    for span in spans + [(duration_sec, duration_sec, 0, -1)]:
        gap_start, gap_end = cursor, span[0]
        while gap_end - gap_start >= _SILENCE_MIN:
            chunk_end = min(gap_start + _SILENCE_CHUNK, gap_end)
            if gap_end - chunk_end < _SILENCE_MIN:
                chunk_end = gap_end
            filled.append((gap_start, chunk_end, 0, -1))
            gap_start = chunk_end
        if span[3] >= span[2]:
            filled.append(span)
        cursor = max(cursor, span[1])

    return [
        Block(
            id=i,
            start=start,
            end=end,
            text="".join(w[2] for w in words[first : last + 1]).strip() if last >= first else "",
            first_word=first,
            last_word=last,
        )
        for i, (start, end, first, last) in enumerate(filled)
    ]


def attach_signals(blocks: list[Block], signals: dict) -> None:
    """Summarise per-second signals per block: the loudest/busiest part of a
    block is what matters, not its average."""
    for block in blocks:
        a, b = int(block.start), max(int(np.ceil(block.end)), int(block.start) + 1)
        for name in ("loudness", "chat", "reactions"):
            values = signals[name][a:b]
            setattr(block, name, float(np.percentile(values, 90)) if values.size else 0.0)
