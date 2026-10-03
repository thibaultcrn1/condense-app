"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type Interval, MIN_CLIP, snap } from "@/lib/clip-snap";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { errorMessage, responseError } from "@/lib/messages";
import type { ProjectDto } from "@/lib/projects";

import { HighlightLibrary } from "./highlight-library";
import { HighlightViewer } from "./highlight-viewer";
import { MontageTimeline } from "./montage-timeline";
import type { Bounds } from "./types";

const SAVE_DEBOUNCE_MS = 800;
const DEFAULT_PX_PER_SEC = 6;

type Playback =
  { kind: "clip"; id: string } | { kind: "montage"; index: number } | null;

export function MontageEditor({
  project,
  onRenderStarted,
}: {
  project: ProjectDto;
  onRenderStarted: (project: ProjectDto) => void;
}) {
  const { t } = useI18n();
  // The debounced save outlives renders; read the latest messages from a ref.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const moments = project.moments;
  const duration =
    project.durationSec ?? Math.max(...moments.map((m) => m.end), 1);
  const momentsById = useMemo(
    () => new Map(moments.map((m) => [m.id, m])),
    [moments],
  );

  const [bounds, setBounds] = useState<Record<string, Bounds>>(() =>
    Object.fromEntries(
      moments.map((m) => [m.id, { start: m.clipStart, end: m.clipEnd }]),
    ),
  );
  const [montage, setMontage] = useState<string[]>(() =>
    project.montage.filter((id) => momentsById.has(id)),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    moments[0]?.id ?? null,
  );
  // Where new clips go: right after this timeline clip (the last one clicked
  // or added), else at the end. Separate from the highlight being viewed.
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [snapToPauses, setSnapToPauses] = useState(true);
  const [pxPerSec, setPxPerSec] = useState(DEFAULT_PX_PER_SEC);
  const [playback, setPlayback] = useState<Playback>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest state for the debounced save and the video event handlers.
  const latest = useRef({ bounds, montage, playback });
  useEffect(() => {
    latest.current = { bounds, montage, playback };
  }, [bounds, montage, playback]);

  useEffect(() => {
    fetch(`/api/projects/${project.id}/cutpoints`)
      .then((res) => (res.ok ? res.json() : { intervals: [] }))
      .then((data) => setIntervals(data.intervals ?? []))
      .catch(() => {});
  }, [project.id]);

  const save = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/projects/${project.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          payload(latest.current.montage, latest.current.bounds),
        ),
      });
      if (!res.ok)
        toast.error(await responseError(tRef.current, res));
    }, SAVE_DEBOUNCE_MS);
  }, [project.id]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  function updateMontage(next: string[]) {
    setMontage(next);
    latest.current.montage = next;
    save();
  }

  function updateBounds(id: string, next: Bounds, movedEdge: "start" | "end") {
    let start = Math.max(0, Math.min(next.start, duration - MIN_CLIP));
    let end = Math.min(duration, Math.max(next.end, start + MIN_CLIP));
    if (movedEdge === "start") start = Math.min(start, end - MIN_CLIP);
    start = Math.round(start * 1000) / 1000;
    end = Math.round(end * 1000) / 1000;
    const nextBounds = { ...bounds, [id]: { start, end } };
    setBounds(nextBounds);
    latest.current.bounds = nextBounds;
    save();
    seek(movedEdge === "start" ? start : Math.max(start, end - 0.05));
  }

  function snapBounds(id: string) {
    if (!snapToPauses || intervals.length === 0) return;
    const b = latest.current.bounds[id];
    const start = snap(intervals, b.start);
    const end = snap(intervals, b.end);
    if (end - start < MIN_CLIP || (start === b.start && end === b.end)) return;
    const nextBounds = { ...latest.current.bounds, [id]: { start, end } };
    setBounds(nextBounds);
    latest.current.bounds = nextBounds;
    save();
  }

  // --- Playback -----------------------------------------------------------

  function seek(t: number) {
    const video = videoRef.current;
    setPlayback(null);
    if (!video) return;
    video.pause();
    video.currentTime = t;
  }

  function playFrom(t: number, next: Playback) {
    const video = videoRef.current;
    setPlayback(next);
    latest.current.playback = next;
    if (!video) return;
    video.currentTime = t;
    video.play().catch(() => {});
  }

  function playClip(id: string) {
    playFrom(bounds[id].start, { kind: "clip", id });
  }

  function toggleMontagePlayback() {
    const video = videoRef.current;
    if (playback?.kind === "montage" && video && isVideoPlaying) {
      video.pause();
      return;
    }
    if (playback?.kind === "montage" && video) {
      video.play().catch(() => {});
      return;
    }
    // Start from the selected clip when it is in the montage.
    const index = Math.max(0, selectedId ? montage.indexOf(selectedId) : 0);
    setSelectedId(montage[index]);
    playFrom(bounds[montage[index]].start, { kind: "montage", index });
  }

  function onTimeUpdate(video: HTMLVideoElement) {
    const t = video.currentTime;
    setCurrentTime(t);
    const { playback: pb, bounds: b, montage: m } = latest.current;
    if (!pb) return;
    if (pb.kind === "clip") {
      if (t >= b[pb.id].end) {
        video.pause();
        setPlayback(null);
      }
      return;
    }
    // Montage: chain the clips back to back.
    const current = b[m[pb.index]];
    if (!current || t >= current.end - 0.03) {
      const next = pb.index + 1;
      if (next < m.length) {
        setSelectedId(m[next]);
        setPlayback({ kind: "montage", index: next });
        latest.current.playback = { kind: "montage", index: next };
        video.currentTime = b[m[next]].start;
      } else {
        video.pause();
        setPlayback(null);
      }
    }
  }

  const playhead = useMemo(() => {
    if (playback?.kind !== "montage") return null;
    const before = montage
      .slice(0, playback.index)
      .reduce((sum, id) => sum + bounds[id].end - bounds[id].start, 0);
    const clip = bounds[montage[playback.index]];
    return clip
      ? before +
          Math.min(Math.max(currentTime - clip.start, 0), clip.end - clip.start)
      : null;
  }, [playback, montage, bounds, currentTime]);

  // --- Montage editing ----------------------------------------------------

  const insertAfter = anchorId && montage.includes(anchorId) ? anchorId : null;
  const insertIndex = insertAfter
    ? montage.indexOf(insertAfter) + 1
    : montage.length;

  function addToMontage(id: string, index = insertIndex) {
    if (montage.includes(id)) return;
    const next = [...montage];
    next.splice(index, 0, id);
    updateMontage(next);
    // Chain further additions after this one.
    setAnchorId(id);
  }

  function removeFromMontage(id: string) {
    updateMontage(montage.filter((x) => x !== id));
  }

  function handleDrop(id: string, from: "library" | "timeline", index: number) {
    const current = montage.indexOf(id);
    if (current === -1) {
      addToMontage(id, index);
    } else {
      // Moving within (or dropping an already-used highlight onto) the timeline.
      const next = montage.filter((x) => x !== id);
      next.splice(current < index ? index - 1 : index, 0, id);
      updateMontage(next);
      setAnchorId(id);
    }
    setSelectedId(id);
  }

  function addAll() {
    updateMontage([
      ...montage,
      ...moments.map((m) => m.id).filter((id) => !montage.includes(id)),
    ]);
  }

  async function startRender() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsRendering(true);
    const res = await fetch(`/api/projects/${project.id}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(montage, bounds)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setIsRendering(false);
      toast.error(errorMessage(t, data.error));
      return;
    }
    onRenderStarted(data.project);
  }

  const selected = selectedId ? momentsById.get(selectedId) : undefined;
  const insertLabel = insertAfter
    ? format(t.editor.addAfter, { index: montage.indexOf(insertAfter) + 1 })
    : t.editor.addToMontage;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-3">
          {project.previewUrl ? (
            <video
              ref={videoRef}
              src={project.previewUrl}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-md bg-black"
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget)}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
          ) : (
            <div className="bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-md text-sm">
              {t.editor.noPreview}
            </div>
          )}
          {selected && (
            <HighlightViewer
              projectId={project.id}
              moment={selected}
              bounds={bounds[selected.id]}
              duration={duration}
              videoRef={videoRef}
              currentTime={currentTime}
              inMontage={montage.includes(selected.id)}
              insertLabel={insertLabel}
              onBoundsChange={(b, edge) => updateBounds(selected.id, b, edge)}
              onBoundsCommit={() => snapBounds(selected.id)}
              onPlay={() => playClip(selected.id)}
              onSeek={seek}
              onToggleMontage={() =>
                montage.includes(selected.id)
                  ? removeFromMontage(selected.id)
                  : addToMontage(selected.id)
              }
            />
          )}
        </div>

        <div className="flex max-h-[80vh] min-h-0 flex-col rounded-lg border p-3">
          <HighlightLibrary
            moments={moments}
            bounds={bounds}
            montage={montage}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              playClip(id);
            }}
            onAddAll={addAll}
          />
        </div>
      </div>

      {/* Always on screen, like an editing app, so highlights can be dropped on it. */}
      <div className="bg-background sticky bottom-0 z-10 pt-2 pb-2">
        <MontageTimeline
          montage={montage}
          momentsById={momentsById}
          bounds={bounds}
          selectedId={selectedId}
          anchorId={insertAfter}
          pxPerSec={pxPerSec}
          playhead={playhead}
          isPlaying={playback?.kind === "montage" && isVideoPlaying}
          onZoom={(factor) =>
            setPxPerSec((p) => Math.min(80, Math.max(0.5, p * factor)))
          }
          onSelect={(id) => {
            setSelectedId(id);
            setAnchorId(id);
            seek(bounds[id].start);
          }}
          onRemove={removeFromMontage}
          onDrop={handleDrop}
          onTogglePlay={toggleMontagePlayback}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-primary size-4"
            checked={snapToPauses}
            onChange={(e) => setSnapToPauses(e.target.checked)}
          />
          {t.editor.snap}
        </label>
        <Button
          onClick={startRender}
          disabled={isRendering || montage.length === 0}
        >
          <Download data-icon="inline-start" />
          {isRendering ? t.editor.exporting : t.editor.export}
        </Button>
      </div>
    </div>
  );
}

function payload(montage: string[], bounds: Record<string, Bounds>) {
  return {
    montage,
    bounds: Object.entries(bounds).map(([id, b]) => ({
      id,
      start: b.start,
      end: b.end,
    })),
  };
}
