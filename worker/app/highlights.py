"""Turns the analysed sequences into tight highlights, the way a best-of
editor would: keep the strongest moments only, and cut each one down to its
core so nothing drags."""

import statistics

from . import heuristic
from .blocks import Block, Sequence

# About one highlight per 6 minutes of stream (a 10 h live gives ~100).
_SECONDS_PER_HIGHLIGHT = 360
_MIN_HIGHLIGHTS = 6
_MIN_SCORE = 6.0
# Tightening never goes below this, and never keeps more than the max.
_MIN_LENGTH = 12.0
_MAX_LENGTH = 75.0


def _intensity(block: Block) -> float:
    excitement = len(heuristic.EXCITEMENT.findall(block.text))
    return block.reactions + block.loudness + 0.5 * excitement


def _length(blocks: list[Block]) -> float:
    return blocks[-1].end - blocks[0].start


def _tighten(blocks: list[Block]) -> list[Block]:
    """Drops calm blocks at both ends, then keeps the most intense window if
    the result is still longer than _MAX_LENGTH."""
    if len(blocks) <= 1:
        return blocks
    threshold = statistics.median(_intensity(b) for b in blocks)
    while len(blocks) > 1 and _intensity(blocks[0]) < threshold and _length(blocks[1:]) >= _MIN_LENGTH:
        blocks = blocks[1:]
    while len(blocks) > 1 and _intensity(blocks[-1]) < threshold and _length(blocks[:-1]) >= _MIN_LENGTH:
        blocks = blocks[:-1]

    if _length(blocks) <= _MAX_LENGTH:
        return blocks
    best, best_score = blocks[:1], float("-inf")
    for i in range(len(blocks)):
        for j in range(i, len(blocks)):
            window = blocks[i : j + 1]
            if _length(window) > _MAX_LENGTH:
                break
            score = sum(_intensity(b) for b in window)
            if score > best_score:
                best, best_score = window, score
    return best


def pick(sequences: list[Sequence], blocks: list[Block], duration: float, retitle: bool) -> list[Sequence]:
    """Returns tightened highlights in source order. With `retitle`, titles
    are recomputed from the kept blocks (heuristic titles quote a line, which
    may have been cut away)."""
    candidates = [s for s in sequences if s.category != "temps_mort"]
    cap = max(_MIN_HIGHLIGHTS, round(duration / _SECONDS_PER_HIGHLIGHT))
    ranked = sorted(candidates, key=lambda s: s.score, reverse=True)
    chosen = [s for s in ranked if s.score >= _MIN_SCORE][:cap]
    if len(chosen) < _MIN_HIGHLIGHTS:
        chosen = ranked[:_MIN_HIGHLIGHTS]

    highlights = []
    for seq in chosen:
        kept = _tighten(blocks[seq.first_block : seq.last_block + 1])
        highlights.append(
            Sequence(
                first_block=kept[0].id,
                last_block=kept[-1].id,
                title=heuristic.title(kept) if retitle else seq.title,
                summary=seq.summary,
                category=seq.category,
                score=seq.score,
                standalone=seq.standalone,
            )
        )
    return sorted(highlights, key=lambda s: s.first_block)
