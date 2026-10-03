export function formatDuration(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")}`;
  if (m > 0) return `${m} min${s ? ` ${String(s).padStart(2, "0")}` : ""}`;
  return `${s} s`;
}

export function formatBytes(bytes: number) {
  const units = ["o", "Ko", "Mo", "Go", "To"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(unit >= 3 ? 1 : 0)} ${units[unit]}`;
}

// Timecode for chapters and timelines: 1:02:03 or 2:03.
export function formatTimecode(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

// Timecode to the tenth of a second, for precise clip editing: 12:03.4
export function formatPreciseTimecode(totalSec: number) {
  const tenths = Math.round(Math.max(0, totalSec) * 10);
  return `${formatTimecode(Math.floor(tenths / 10))}.${tenths % 10}`;
}
