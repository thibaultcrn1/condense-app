"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MontageEditor } from "@/components/editor/montage-editor";
import { ProjectOutputs } from "@/components/project-outputs";
import { ACTIVE_STATUSES, ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { formatBytes, formatDuration } from "@/lib/format";
import { useI18n } from "@/i18n/client";
import { errorMessage, responseError, stageLabel } from "@/lib/messages";
import type { ProjectDto } from "@/lib/projects";

const POLL_MS = 3000;

export function ProjectDetails({ initialProject }: { initialProject: ProjectDto }) {
  const router = useRouter();
  const { t, href } = useI18n();
  const [project, setProject] = useState(initialProject);
  const [isBusy, setIsBusy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isActive = ACTIVE_STATUSES.includes(project.status);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/projects/${project.id}`, { cache: "no-store" });
      if (res.ok) setProject((await res.json()).project);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [isActive, project.id]);

  async function handleDelete() {
    if (!confirm(t.project.confirmDelete)) return;
    setIsBusy(true);
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (!res.ok) {
      setIsBusy(false);
      toast.error(await responseError(t, res));
      return;
    }
    router.push(href("/dashboard"));
    router.refresh();
  }

  async function handleRetry() {
    setIsBusy(true);
    const res = await fetch(`/api/projects/${project.id}/retry`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setIsBusy(false);
    if (!res.ok) {
      toast.error(errorMessage(t, data.error));
      return;
    }
    setProject(data.project);
  }

  const details: [string, string][] = [];
  details.push([
    t.project.source,
    project.sourceType === "TWITCH" ? (project.sourceUrl ?? "Twitch") : (project.sourceFileName ?? t.project.file),
  ]);
  if (project.sourceSize) details.push([t.project.size, formatBytes(project.sourceSize)]);
  if (project.durationSec) details.push([t.project.duration, formatDuration(project.durationSec)]);
  if (project.width && project.height) {
    details.push([
      t.project.video,
      `${project.width}×${project.height}${project.fps ? ` · ${Math.round(project.fps)} fps` : ""}`,
    ]);
  }
  if (project.sourceType === "TWITCH" && project.durationSec) {
    details.push([t.project.chat, project.hasChat ? t.project.chatOk : t.project.chatMissing]);
  }

  const showReview = project.status === "REVIEW" || (project.status === "DONE" && isEditing);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{project.title}</h1>
          <div className="mt-1">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={isBusy || (isActive && project.status !== "QUEUED")}
        >
          {t.project.delete}
        </Button>
      </div>

      {isActive && (
        <Card>
          <CardContent>
            <Progress value={Math.round(project.progress * 100)}>
              <ProgressLabel>{stageLabel(t, project.stage)}</ProgressLabel>
              <ProgressValue />
            </Progress>
          </CardContent>
        </Card>
      )}

      {project.status === "FAILED" && (
        <Card>
          <CardHeader>
            <CardTitle>{t.project.failedTitle}</CardTitle>
            <CardDescription>{errorMessage(t, project.error, project.errorParams)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry} disabled={isBusy}>
              {t.project.retry}
            </Button>
          </CardContent>
        </Card>
      )}

      {project.status === "INGESTED" && (
        <Card>
          <CardHeader>
            <CardTitle>{t.project.legacyTitle}</CardTitle>
            <CardDescription>
              {t.project.legacyText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry} disabled={isBusy}>
              {t.project.legacyButton}
            </Button>
          </CardContent>
        </Card>
      )}

      {project.status === "DONE" && !isEditing && (
        <>
          <ProjectOutputs outputs={project.outputs} />
          <div>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              {t.project.editMontage}
            </Button>
          </div>
        </>
      )}

      {showReview && (
        <MontageEditor
          project={project}
          onRenderStarted={(next) => {
            setIsEditing(false);
            setProject(next);
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t.project.details}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
