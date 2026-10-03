"""Turns the user's montage into cuts and chapters for the render."""

from dataclasses import dataclass


@dataclass
class Cut:
    start: float
    end: float
    # Moments covered by this cut, for chapters.
    moment_ids: list[str]


def clip_bounds(m: dict) -> tuple[float, float]:
    # Moments from older analyses may only have their detected span.
    start = m.get("clipStart")
    end = m.get("clipEnd")
    return (m["start"] if start is None else start, m["end"] if end is None else end)


def cuts_from_montage(moments: list[dict]) -> list[Cut]:
    """One cut per clip, in montage order (not source order). Two clips that
    follow each other in the montage and touch in the source are joined into
    one continuous shot. Bounds are used exactly as set."""
    cuts: list[Cut] = []
    for m in moments:
        start, end = clip_bounds(m)
        if cuts and abs(start - cuts[-1].end) < 0.05:
            cuts[-1].end = end
            cuts[-1].moment_ids.append(m["id"])
        else:
            cuts.append(Cut(start=start, end=end, moment_ids=[m["id"]]))
    return cuts


def chapters(cuts: list[Cut], moments_by_id: dict[str, dict]) -> list[dict]:
    """YouTube-style chapters on the output timeline, one per clip."""
    result = []
    offset = 0.0
    for cut in cuts:
        for moment_id in cut.moment_ids:
            m = moments_by_id[moment_id]
            result.append({"start": round(offset + max(0.0, clip_bounds(m)[0] - cut.start), 2), "title": m["title"]})
        offset += cut.end - cut.start
    if result:
        result[0]["start"] = 0.0
    return result
