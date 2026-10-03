"use client";

import { Pause, Play, X, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDuration, formatTimecode } from "@/lib/format";
import type { MomentDto } from "@/lib/projects";
import { cn } from "@/lib/utils";

import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";

import { type Bounds, DRAG_TYPE } from "./types";

const MIN_BLOCK_PX = 56;
const TRACK_PADDING_PX = 8;
// Ruler ticks: the smallest step that keeps labels at least this far apart.
const MIN_TICK_PX = 80;
const TICK_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800];

export function MontageTimeline({
  montage,
  momentsById,
  bounds,
  selectedId,
  anchorId,
  pxPerSec,
  playhead,
  isPlaying,
  onZoom,
  onSelect,
  onRemove,
  onDrop,
  onTogglePlay,
}: {
  montage: string[];
  momentsById: Map<string, MomentDto>;
  bounds: Record<string, Bounds>;
  selectedId: string | null;
  // Clip after which new highlights are inserted; marked on the track.
  anchorId: string | null;
  pxPerSec: number;
  // Position in the montage (seconds) while it plays, else null.
  playhead: number | null;
  isPlaying: boolean;
  onZoom: (factor: number) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDrop: (id: string, from: "library" | "timeline", index: number) => void;
  onTogglePlay: () => void;
}) {
  const { t } = useI18n();
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const lengths = montage.map((id) => bounds[id].end - bounds[id].start);
  const widths = lengths.map((l) => Math.max(l * pxPerSec, MIN_BLOCK_PX));
  const total = lengths.reduce((a, b) => a + b, 0);
  const trackWidth = widths.reduce((a, b) => a + b, 0);

  // Maps a montage time to x, accounting for blocks widened to MIN_BLOCK_PX.
  function timeToX(t: number) {
    let x = 0;
    for (let i = 0; i < lengths.length; i++) {
      if (t <= lengths[i]) return x + (t / lengths[i]) * widths[i];
      t -= lengths[i];
      x += widths[i];
    }
    return x;
  }

  function indexAt(clientX: number) {
    for (let i = 0; i < montage.length; i++) {
      const rect = blockRefs.current[i]?.getBoundingClientRect();
      if (rect && clientX < rect.left + rect.width / 2) return i;
    }
    return montage.length;
  }

  const tickStep = TICK_STEPS.find((s) => s * pxPerSec >= MIN_TICK_PX) ?? 3600;
  const ticks = Array.from(
    { length: Math.floor(total / tickStep) + 1 },
    (_, i) => i * tickStep,
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onTogglePlay}
            disabled={montage.length === 0}
          >
            {isPlaying ? (
              <Pause data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {isPlaying ? t.editor.pause : t.editor.playMontage}
          </Button>
          <p className="text-sm tabular-nums">
            <span className="font-semibold">
              {formatTimecode(Math.round(total))}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · {format(t.editor.clipsCount, { count: montage.length })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.editor.zoomOut}
            onClick={() => onZoom(1 / 1.5)}
          >
            <ZoomOut />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.editor.zoomIn}
            onClick={() => onZoom(1.5)}
          >
            <ZoomIn />
          </Button>
        </div>
      </div>

      <div
        className="overflow-x-auto pb-1"
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
          e.preventDefault();
          setDropIndex(indexAt(e.clientX));
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setDropIndex(null);
        }}
        onDrop={(e) => {
          const raw = e.dataTransfer.getData(DRAG_TYPE);
          const index = indexAt(e.clientX);
          setDropIndex(null);
          if (!raw) return;
          e.preventDefault();
          const { id, from } = JSON.parse(raw) as {
            id: string;
            from: "library" | "timeline";
          };
          onDrop(id, from, index);
        }}
      >
        <div
          className="relative min-w-full"
          style={{ width: trackWidth + 2 * TRACK_PADDING_PX }}
        >
          {/* Ruler */}
          <div className="text-muted-foreground relative h-5 text-[10px] tabular-nums">
            {ticks.map((t) => (
              <span
                key={t}
                className="border-muted-foreground/40 absolute top-0 h-full border-l pl-1"
                style={{ left: TRACK_PADDING_PX + timeToX(t) }}
              >
                {formatTimecode(t)}
              </span>
            ))}
          </div>

          {/* Track */}
          <div
            className="bg-muted/40 relative flex h-24 items-stretch rounded-md"
            style={{
              paddingLeft: TRACK_PADDING_PX,
              paddingRight: TRACK_PADDING_PX,
            }}
          >
            {montage.length === 0 && (
              <p className="text-muted-foreground m-auto px-4 text-center text-sm">
                {t.editor.emptyTimeline}
              </p>
            )}
            {montage.map((id, i) => {
              const moment = momentsById.get(id)!;
              return (
                <div
                  key={id}
                  ref={(el) => {
                    blockRefs.current[i] = el;
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      DRAG_TYPE,
                      JSON.stringify({ id, from: "timeline" }),
                    );
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => onSelect(id)}
                  className={cn(
                    "group relative my-1 shrink-0 cursor-grab overflow-hidden rounded border-2 border-background bg-cover bg-center",
                    id === selectedId && "border-primary",
                  )}
                  style={{
                    width: widths[i],
                    backgroundImage: moment.thumbUrl
                      ? `url(${moment.thumbUrl})`
                      : undefined,
                  }}
                  title={moment.title}
                >
                  <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/10 to-black/40 p-1 text-white">
                    <span className="truncate text-[11px] font-medium">
                      {i + 1}. {moment.title}
                    </span>
                    <span className="text-[10px] tabular-nums">
                      {formatDuration(lengths[i])}
                    </span>
                  </div>
                  {id === anchorId && (
                    <span
                      className="bg-primary absolute top-0 right-0 bottom-0 w-1"
                      title={t.editor.insertHere}
                    />
                  )}
                  <button
                    type="button"
                    aria-label={t.editor.removeClip}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(id);
                    }}
                    className="absolute top-1 right-1 hidden rounded bg-black/70 p-0.5 text-white group-hover:block"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })}

            {dropIndex !== null && (
              <div
                className="bg-primary pointer-events-none absolute top-0 bottom-0 w-0.5"
                style={{
                  left:
                    TRACK_PADDING_PX +
                    widths.slice(0, dropIndex).reduce((a, b) => a + b, 0) -
                    1,
                }}
              />
            )}
            {playhead !== null && (
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: TRACK_PADDING_PX + timeToX(playhead) }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
