"""Clip bounds: where each highlight starts and ends in the source.

Cuts only land in "safe" intervals: pauses between words, or stretches with
no speech at all. The editor snaps user edits to the same intervals (see
src/lib/clip-snap.ts)."""

# A pause at least this long between two words is a clean place to cut.
_MIN_GAP = 0.25
# Stay this far from the neighbouring words so no syllable is clipped.
_WORD_MARGIN = 0.05
# Breathing room added around speech when there is room for it.
_LEAD_IN = 0.3
_TAIL_OUT = 0.45

Interval = tuple[float, float]


def safe_intervals(words: list, duration: float) -> list[Interval]:
    intervals: list[Interval] = []
    previous_end: float | None = None
    for start, end, _ in words:
        if previous_end is None:
            # Before the first word: everything up to it is safe.
            if start - _WORD_MARGIN > 0:
                intervals.append((0.0, round(start - _WORD_MARGIN, 3)))
        elif start - previous_end >= _MIN_GAP:
            intervals.append((round(previous_end + _WORD_MARGIN, 3), round(start - _WORD_MARGIN, 3)))
        previous_end = end if previous_end is None else max(previous_end, end)
    tail = 0.0 if previous_end is None else previous_end + _WORD_MARGIN
    if duration > tail:
        intervals.append((round(tail, 3), round(duration, 3)))
    return intervals


def _containing(intervals: list[Interval], t: float) -> Interval | None:
    for a, b in intervals:
        if a - 1e-6 <= t <= b + 1e-6:
            return (a, b)
    return None


def snap(intervals: list[Interval], t: float, direction: int, limit: float = 4.0) -> float:
    """Nearest safe time to `t`: inside a safe interval, `t` itself; else the
    closest interval edge going `direction` (-1 earlier, +1 later, 0 either)
    within `limit` seconds. Returns `t` unchanged if nothing is close."""
    if _containing(intervals, t):
        return t
    best, best_distance = t, limit + 1e-9
    for a, b in intervals:
        for edge in (a, b):
            delta = edge - t
            if direction < 0 and delta > 0 or direction > 0 and delta < 0:
                continue
            if abs(delta) < best_distance:
                best, best_distance = edge, abs(delta)
    return best


def initial_bounds(moments: list[dict], intervals: list[Interval], duration: float) -> None:
    """Sets clipStart/clipEnd on every moment: its detected span plus a little
    breathing room inside the surrounding pauses, never overlapping the
    neighbouring moment."""
    ordered = sorted(moments, key=lambda m: m["start"])
    for i, m in enumerate(ordered):
        start, end = m["start"], m["end"]
        before = _containing(intervals, start - _WORD_MARGIN)
        after = _containing(intervals, end + _WORD_MARGIN)
        clip_start = max(before[0], start - _LEAD_IN) if before else start
        clip_end = min(after[1], end + _TAIL_OUT) if after else end
        # Adjacent moments share the pause between them: split it.
        if i > 0 and clip_start < ordered[i - 1]["clipEnd"]:
            middle = (ordered[i - 1]["end"] + start) / 2
            ordered[i - 1]["clipEnd"] = min(ordered[i - 1]["clipEnd"], middle)
            clip_start = max(clip_start, middle)
        m["clipStart"] = round(max(0.0, clip_start), 3)
        m["clipEnd"] = round(min(duration, clip_end), 3)
