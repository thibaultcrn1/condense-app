"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDuration, formatTimecode } from "@/lib/format";
import { useI18n } from "@/i18n/client";
import type { OutputDto } from "@/lib/projects";

export function ProjectOutputs({ outputs }: { outputs: OutputDto[] }) {
  const { t } = useI18n();
  return (
    <div className="flex max-w-4xl flex-col gap-4">
      {outputs.map((output) => {
        const title = t.project.finalVideo;
        const chapters = output.chapters
          .map((c) => `${formatTimecode(c.start)} ${c.title}`)
          .join("\n");
        return (
          <Card key={output.url}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {formatDuration(output.durationSec)} · {formatBytes(output.size)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <video
                src={output.url}
                controls
                preload="metadata"
                className="aspect-video w-full rounded-md bg-black"
              />
              <div className="flex flex-wrap gap-2">
                <Button nativeButton={false} render={<a href={output.downloadUrl} />}>
                  <Download data-icon="inline-start" />
                  {t.project.download}
                </Button>
                {chapters && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(chapters)
                        .then(() => toast.success(t.project.chaptersCopied))
                        .catch(() => toast.error(t.project.copyFailed))
                    }
                  >
                    {t.project.copyChapters}
                  </Button>
                )}
              </div>
              {chapters && (
                <pre className="bg-muted/50 max-h-48 overflow-auto rounded-md p-3 text-xs">{chapters}</pre>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
