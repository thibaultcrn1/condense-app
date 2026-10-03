"use client";

import { Minus, Play, Plus, X } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MIN_CLIP } from "@/lib/clip-snap";
import {
  formatPreciseTimecode,
  formatTimecode,
} from "@/lib/format";
import type { MomentDto } from "@/lib/projects";
import { cn } from "@/lib/utils";

import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";

import { type Bounds } from "./types";

// Context around the clip on the trim bar and in the transcript, so a
// highlight can be extended as well as shortened.
const CONTEXT_SEC = 30;
const NUDGE_SEC = 0.5;

type Word = [number, number, string];

export function HighlightViewer({
  projectId,
  moment,
  bounds,
  duration,
  videoRef,
  currentTime,
  inMontage,
  insertLabel,
  onBoundsChange,
  onBoundsCommit,
  onPlay,
  onSeek,
  onToggleMontage,
}: {
  projectId: string;
  moment: MomentDto;
  bounds: Bounds;
  duration: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  currentTime: number;
  inMontage: boolean;
  insertLabel: string;
  onBoundsChange: (bounds: Bounds, movedEdge: "start" | "end") => void;
  onBoundsCommit: () => void;
  onPlay: () => void;
  onSeek: (t: number) => void;
  onToggleMontage: () => void;
}) {
  const { t } = useI18n();
  const windowStart = Math.max(
    0,
    Math.min(moment.start, bounds.start) - CONTEXT_SEC,
  );
  const windowEnd = Math.min(
    duration,
    Math.max(moment.end, bounds.end) + CONTEXT_SEC,
  );

  const setEdge = (edge: "start" | "end", value: number) =>
    onBoundsChange({ ...bounds, [edge]: value }, edge);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{moment.title}</p>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">
              {t.categories[moment.category] ?? moment.category}
            </Badge>
            <span>{moment.score}/10</span>
            <span>{format(t.editor.inLive, { time: formatTimecode(bounds.start) })}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPlay}>
            <Play data-icon="inline-start" />
            {t.editor.playClip}
          </Button>
          <Button
            variant={inMontage ? "outline" : "default"}
            onClick={onToggleMontage}
          >
            {inMontage ? (
              <X data-icon="inline-start" />
            ) : (
              <Plus data-icon="inline-start" />
            )}
            {inMontage ? t.editor.removeFromMontage : insertLabel}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
          <span>{formatTimecode(windowStart)}</span>
          <span className="text-foreground font-medium">
            {format(t.editor.duration, { duration: formatPreciseTimecode(bounds.end - bounds.start) })}
          </span>
          <span>{formatTimecode(windowEnd)}</span>
        </div>
        <Slider
          min={windowStart}
          max={windowEnd}
          step={0.1}
          minStepsBetweenValues={MIN_CLIP / 0.1}
          value={[bounds.start, bounds.end]}
          onValueChange={(value, details) => {
            const [start, end] = value as number[];
            onBoundsChange(
              { start, end },
              details.activeThumbIndex === 0 ? "start" : "end",
            );
          }}
          onValueCommitted={onBoundsCommit}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm tabular-nums">
          <EdgeControl
            label={t.editor.start}
            value={bounds.start}
            onNudge={(d) => setEdge("start", bounds.start + d)}
            onHere={() =>
              setEdge("start", videoRef.current?.currentTime ?? bounds.start)
            }
          />
          <EdgeControl
            label={t.editor.end}
            value={bounds.end}
            onNudge={(d) => setEdge("end", bounds.end + d)}
            onHere={() =>
              setEdge("end", videoRef.current?.currentTime ?? bounds.end)
            }
          />
        </div>
      </div>

      <Transcript
        projectId={projectId}
        from={windowStart}
        to={windowEnd}
        bounds={bounds}
        currentTime={currentTime}
        onSeek={onSeek}
      />
    </div>
  );
}

function EdgeControl({
  label,
  value,
  onNudge,
  onHere,
}: {
  label: string;
  value: number;
  onNudge: (delta: number) => void;
  onHere: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground mr-1">{label}</span>
      <Button
        variant="outline"
        size="icon-xs"
        aria-label={`${label} −${NUDGE_SEC} s`}
        onClick={() => onNudge(-NUDGE_SEC)}
      >
        <Minus />
      </Button>
      <span className="w-16 text-center">{formatPreciseTimecode(value)}</span>
      <Button
        variant="outline"
        size="icon-xs"
        aria-label={`${label} +${NUDGE_SEC} s`}
        onClick={() => onNudge(NUDGE_SEC)}
      >
        <Plus />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        onClick={onHere}
        title={t.editor.hereTitle}
      >
        {t.editor.here}
      </Button>
    </div>
  );
}

// The words around the clip. Words inside the clip are highlighted, the one
// being played is marked, and clicking a word jumps the player there.
function Transcript({
  projectId,
  from,
  to,
  bounds,
  currentTime,
  onSeek,
}: {
  projectId: string;
  from: number;
  to: number;
  bounds: Bounds;
  currentTime: number;
  onSeek: (t: number) => void;
}) {
  const { t } = useI18n();
  const [words, setWords] = useState<Word[] | null>(null);
  // Refetch only when the window moves by whole seconds, not on every drag step.
  const fromKey = Math.floor(from);
  const toKey = Math.ceil(to);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/projects/${projectId}/transcript?from=${fromKey}&to=${toKey}`,
      );
      if (!cancelled && res.ok) setWords((await res.json()).words);
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [projectId, fromKey, toKey]);

  // Keep the word being played (or, before playing, the clip's first word)
  // in view, scrolling only this box and never the page.
  const boxRef = useRef<HTMLDivElement>(null);
  const focusIndex = words
    ? Math.max(
        words.findIndex(([start, end]) => currentTime >= start && currentTime < end),
        words.findIndex(([, end]) => end > bounds.start),
      )
    : -1;
  useEffect(() => {
    const box = boxRef.current;
    const word = box?.querySelector<HTMLElement>(`[data-word="${focusIndex}"]`);
    if (!box || !word) return;
    const top = word.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 40) {
      box.scrollTo({ top: Math.max(0, top - 40), behavior: "smooth" });
    }
  }, [focusIndex]);

  return (
    <div
      ref={boxRef}
      className="relative max-h-56 overflow-y-auto rounded-lg border p-3 text-sm leading-relaxed"
    >
      <p className="text-muted-foreground mb-2 text-xs">
        {t.editor.transcript}
      </p>
      {words === null ? (
        <p className="text-muted-foreground">{t.common.loading}</p>
      ) : words.length === 0 ? (
        <p className="text-muted-foreground">{t.editor.noSpeech}</p>
      ) : (
        <p>
          {words.map(([start, end, text], i) => {
            const inside = end > bounds.start && start < bounds.end;
            const playing = currentTime >= start && currentTime < end;
            return (
              <span
                key={i}
                data-word={i}
                role="button"
                tabIndex={-1}
                onClick={() => onSeek(start)}
                className={cn(
                  "cursor-pointer rounded-sm hover:bg-muted",
                  !inside && "text-muted-foreground/60",
                  playing && "bg-primary text-primary-foreground",
                )}
              >
                {text}
              </span>
            );
          })}
        </p>
      )}
    </div>
  );
}
