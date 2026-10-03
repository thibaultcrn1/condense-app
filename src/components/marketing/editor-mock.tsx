// Illustration of the editor for the landing page: decorative, built from
// plain elements so it stays crisp in both themes and costs no image weight.
const THUMBS = [
  "from-violet-500 to-fuchsia-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
];
const WIDTHS = [22, 14, 18, 26, 12];

export function EditorMock({ labels }: { labels: { library: string; timeline: string; playing: string; clips: string[] } }) {
  return (
    <div aria-hidden="true" className="bg-card relative rounded-2xl border p-3 shadow-2xl shadow-violet-500/10 sm:p-4">
      <div className="mb-3 flex gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.35),transparent_45%)]" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            {labels.playing} · {labels.clips[0]}
          </div>
          <div className="absolute right-3 bottom-3 left-40 hidden h-1 overflow-hidden rounded-full bg-white/30 sm:block">
            <div className="h-full w-2/5 rounded-full bg-white" />
          </div>
        </div>
        <div className="hidden flex-col gap-2 sm:flex">
          <p className="text-muted-foreground text-xs font-medium">{labels.library}</p>
          {labels.clips.slice(0, 4).map((clip, i) => (
            <div key={clip} className="bg-muted/60 flex items-center gap-2 rounded-md p-1.5">
              <div className={`aspect-video w-12 shrink-0 rounded bg-gradient-to-br ${THUMBS[i]}`} />
              <span className="truncate text-xs">{clip}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-lg border p-2">
        <p className="text-muted-foreground mb-2 text-xs font-medium">{labels.timeline}</p>
        <div className="relative flex h-12 gap-1 overflow-hidden">
          {labels.clips.map((clip, i) => (
            <div
              key={clip}
              className={`h-full shrink-0 rounded bg-gradient-to-br ${THUMBS[i]} opacity-90`}
              style={{ width: `${WIDTHS[i]}%` }}
            />
          ))}
          <div className="animate-playhead absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </div>
      </div>
    </div>
  );
}
