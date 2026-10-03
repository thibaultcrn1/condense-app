"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration, formatTimecode } from "@/lib/format";
import type { MomentDto } from "@/lib/projects";
import { cn } from "@/lib/utils";

import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";

import { type Bounds, DRAG_TYPE } from "./types";

export function HighlightLibrary({
  moments,
  bounds,
  montage,
  selectedId,
  onSelect,
  onAddAll,
}: {
  moments: MomentDto[];
  bounds: Record<string, Bounds>;
  montage: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddAll: () => void;
}) {
  const { t } = useI18n();
  const [sort, setSort] = useState<"chrono" | "score">("chrono");
  const sorted =
    sort === "chrono"
      ? moments
      : [...moments].sort((a, b) => b.score - a.score);
  const position = new Map(montage.map((id, i) => [id, i + 1]));

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{format(t.editor.highlightsCount, { count: moments.length })}</p>
        <Tabs
          value={sort}
          onValueChange={(v) => setSort(v as "chrono" | "score")}
        >
          <TabsList>
            <TabsTrigger value="chrono">{t.editor.sortChrono}</TabsTrigger>
            <TabsTrigger value="score">{t.editor.sortBest}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {sorted.map((moment) => {
          const b = bounds[moment.id];
          const index = position.get(moment.id);
          return (
            <li key={moment.id}>
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    DRAG_TYPE,
                    JSON.stringify({ id: moment.id, from: "library" }),
                  );
                  e.dataTransfer.effectAllowed = "copyMove";
                }}
                onClick={() => onSelect(moment.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md p-1.5 text-left hover:bg-muted",
                  moment.id === selectedId && "bg-muted ring-1 ring-ring",
                )}
              >
                <div
                  className="bg-muted relative aspect-video w-24 shrink-0 rounded bg-cover bg-center"
                  style={
                    moment.thumbUrl
                      ? { backgroundImage: `url(${moment.thumbUrl})` }
                      : undefined
                  }
                >
                  {index && (
                    <span className="bg-primary text-primary-foreground absolute top-0.5 left-0.5 rounded px-1 text-[10px] font-semibold">
                      #{index}
                    </span>
                  )}
                  <span className="absolute right-0.5 bottom-0.5 rounded bg-black/70 px-1 text-[10px] text-white tabular-nums">
                    {formatDuration(b.end - b.start)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium">
                    {moment.title}
                  </p>
                  <p className="text-muted-foreground text-[11px] tabular-nums">
                    {formatTimecode(b.start)} ·{" "}
                    {t.categories[moment.category] ?? moment.category} ·{" "}
                    {moment.score}/10
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddAll}
        disabled={montage.length === moments.length}
      >
        {t.editor.addAll}
      </Button>
    </div>
  );
}
