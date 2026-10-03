// Snapping rules for clip edits. Mirrors worker/app/clips.py: cuts land in
// "safe" intervals (pauses between words), so no syllable is clipped.

export type Interval = [number, number];

export const MIN_CLIP = 1;
const SNAP_LIMIT = 1.5;

function containing(intervals: Interval[], t: number): Interval | null {
  for (const interval of intervals) {
    if (interval[0] - 1e-6 <= t && t <= interval[1] + 1e-6) return interval;
  }
  return null;
}

/** Nearest safe time to `t` (itself if already in a pause), looking earlier
 * (-1), later (+1) or both (0), within `limit` seconds. */
export function snap(intervals: Interval[], t: number, direction: -1 | 0 | 1 = 0, limit = SNAP_LIMIT) {
  if (containing(intervals, t)) return t;
  let best = t;
  let bestDistance = limit + 1e-9;
  for (const [a, b] of intervals) {
    for (const edge of [a, b]) {
      const delta = edge - t;
      if ((direction < 0 && delta > 0) || (direction > 0 && delta < 0)) continue;
      if (Math.abs(delta) < bestDistance) {
        best = edge;
        bestDistance = Math.abs(delta);
      }
    }
  }
  return best;
}
