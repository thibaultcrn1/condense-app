import "server-only";

import type { Project } from "@prisma/client";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { presignedGet } from "@/lib/storage";

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

const objectId = z.string().regex(/^[a-f0-9]{24}$/);

export async function getProjectForUser(projectId: string, userId: string) {
  if (!objectId.safeParse(projectId).success) return null;
  return prisma.project.findFirst({ where: { id: projectId, userId } });
}

export function listProjectsForUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

function outputFileName(project: Project) {
  const base = project.title.replace(/[\\/:*?"<>|]+/g, "").trim() || "video";
  return `${base} - Best-of.mp4`;
}

// What the browser is allowed to see: no storage keys or upload ids. Output
// files come with short-lived signed URLs.
export async function toProjectDto(project: Project) {
  const outputs = await Promise.all(
    project.outputs.map(async (output) => ({
      durationSec: output.durationSec,
      size: output.size,
      chapters: output.chapters,
      url: await presignedGet(output.key),
      downloadUrl: await presignedGet(output.key, outputFileName(project)),
    })),
  );

  // Lets the review screen preview moments straight from the original VOD.
  const hasMoments = project.moments.length > 0;
  const previewUrl =
    hasMoments && project.sourceKey && !project.uploadId ? await presignedGet(project.sourceKey) : null;

  return {
    id: project.id,
    title: project.title,
    sourceType: project.sourceType,
    sourceUrl: project.sourceUrl,
    sourceFileName: project.sourceFileName,
    sourceSize: project.sourceSize,
    durationSec: project.durationSec,
    width: project.width,
    height: project.height,
    fps: project.fps,
    hasChat: Boolean(project.chatKey),
    status: project.status,
    stage: project.stage,
    progress: project.progress,
    error: project.error,
    errorParams: (project.errorParams ?? {}) as Record<string, string | number>,
    moments: await Promise.all(
      project.moments.map(async (m) => ({
        id: m.id,
        start: m.start,
        end: m.end,
        clipStart: m.clipStart ?? m.start,
        clipEnd: m.clipEnd ?? m.end,
        title: m.title,
        summary: m.summary,
        category: m.category,
        score: m.score,
        thumbUrl: m.thumbKey ? await presignedGet(m.thumbKey) : null,
      })),
    ),
    montage: project.montage,
    previewUrl,
    outputs,
    createdAt: project.createdAt.toISOString(),
  };
}

export type ProjectDto = Awaited<ReturnType<typeof toProjectDto>>;
export type MomentDto = ProjectDto["moments"][number];
export type OutputDto = ProjectDto["outputs"][number];
