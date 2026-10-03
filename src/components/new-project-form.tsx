"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { formatBytes } from "@/lib/format";
import { errorMessage } from "@/lib/messages";
import { uploadMultipart } from "@/lib/multipart-upload";
import type { CreateProjectInput } from "@/lib/project-schema";
import type { ProjectDto } from "@/lib/projects";

type SourceTab = "upload" | "twitch";

export function NewProjectForm() {
  const router = useRouter();
  const { t, href } = useI18n();
  const [sourceTab, setSourceTab] = useState<SourceTab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [twitchUrl, setTwitchUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploaded, setUploaded] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isUploading = uploaded !== null;

  useEffect(() => {
    if (!isUploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isUploading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const source: CreateProjectInput["source"] | null =
      sourceTab === "upload"
        ? file && {
            type: "upload",
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type || "video/mp4",
          }
        : { type: "twitch", url: twitchUrl.trim() };
    if (!source) {
      toast.error(t.newProject.chooseFile);
      return;
    }

    const body: CreateProjectInput = {
      title: title.trim() || file?.name.replace(/\.[^.]+$/, "") || t.newProject.untitled,
      source,
    };

    setIsSubmitting(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setIsSubmitting(false);
      toast.error(errorMessage(t, data.error));
      return;
    }

    const project: ProjectDto = data.project;
    if (!data.upload || !file) {
      router.push(href(`/dashboard/projects/${project.id}`));
      return;
    }

    abortRef.current = new AbortController();
    setUploaded(0);
    try {
      const parts = await uploadMultipart({
        file,
        partSize: data.upload.partSize,
        urls: data.upload.urls,
        onProgress: setUploaded,
        signal: abortRef.current.signal,
      });
      const done = await fetch(`/api/projects/${project.id}/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parts }),
      });
      if (!done.ok) {
        throw new Error(errorMessage(t, (await done.json().catch(() => ({}))).error));
      }
      router.push(href(`/dashboard/projects/${project.id}`));
    } catch (error) {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" }).catch(() => {});
      setUploaded(null);
      setIsSubmitting(false);
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        toast.error(error instanceof Error ? error.message : t.newProject.uploadFailed);
      }
    }
  }

  const percent = file && uploaded !== null ? Math.round((uploaded / file.size) * 100) : 0;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>{t.newProject.title}</CardTitle>
        <CardDescription>
          {t.newProject.description}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6">
          <Tabs value={sourceTab} onValueChange={(v) => setSourceTab(v as SourceTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" disabled={isSubmitting}>
                {t.newProject.tabFile}
              </TabsTrigger>
              <TabsTrigger value="twitch" disabled={isSubmitting}>
                {t.newProject.tabTwitch}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="flex flex-col gap-2 pt-2">
              <Label htmlFor="file">{t.newProject.fileLabel}</Label>
              <Input
                id="file"
                type="file"
                accept="video/*"
                disabled={isSubmitting}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="text-muted-foreground">
                  {file.name} · {formatBytes(file.size)}
                </p>
              )}
            </TabsContent>
            <TabsContent value="twitch" className="flex flex-col gap-2 pt-2">
              <Label htmlFor="twitch">{t.newProject.twitchLabel}</Label>
              <Input
                id="twitch"
                type="url"
                placeholder="https://www.twitch.tv/videos/1234567890"
                value={twitchUrl}
                disabled={isSubmitting}
                onChange={(e) => setTwitchUrl(e.target.value)}
              />
              <p className="text-muted-foreground">
                {t.newProject.twitchHint}
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{t.newProject.titleLabel}</Label>
            <Input
              id="title"
              placeholder={t.newProject.titlePlaceholder}
              value={title}
              maxLength={120}
              disabled={isSubmitting}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {isUploading && file && (
            <Progress value={percent}>
              <ProgressLabel>
                {format(t.newProject.uploadProgress, { done: formatBytes(uploaded), total: formatBytes(file.size) })}
              </ProgressLabel>
              <ProgressValue />
            </Progress>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isUploading ? t.newProject.uploading : isSubmitting ? t.newProject.creating : t.newProject.submit}
          </Button>
          {isUploading && (
            <Button type="button" variant="outline" onClick={() => abortRef.current?.abort()}>
              {t.common.cancel}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
