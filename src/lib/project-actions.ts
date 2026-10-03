import "server-only";

import type { Project, ProjectStatus } from "@prisma/client";

import { MIN_CLIP } from "@/lib/clip-snap";
import { prisma } from "@/lib/prisma";
import type { EditInput } from "@/lib/project-schema";
import { enqueueProject, type PipelineJobName } from "@/lib/queue";

// Statuses in which a worker may be touching the project.
export const BUSY_STATUSES: ProjectStatus[] = ["QUEUED", "INGESTING", "ANALYZING", "RENDERING"];

// The montage can be edited once analysis is done, including after a render,
// to produce a new version.
export const EDITABLE_STATUSES: ProjectStatus[] = ["REVIEW", "DONE"];

// Validates and stores the editor state: montage order and highlight bounds.
export async function applyEdit(project: Project, edit: EditInput) {
  const known = new Set(project.moments.map((m) => m.id));
  if ([...edit.montage, ...edit.bounds.map((b) => b.id)].some((id) => !known.has(id))) {
    return { error: "unknown_highlight" };
  }
  if (new Set(edit.montage).size !== edit.montage.length) {
    return { error: "duplicate_highlight" };
  }
  const duration = project.durationSec ?? Infinity;
  if (edit.bounds.some((b) => b.start < 0 || b.end > duration + 0.01 || b.end - b.start < MIN_CLIP - 0.01)) {
    return { error: "invalid_bounds" };
  }

  const bounds = new Map(edit.bounds.map((b) => [b.id, b]));
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      montage: edit.montage,
      moments: project.moments.map((m) => {
        const b = bounds.get(m.id);
        return b ? { ...m, clipStart: b.start, clipEnd: b.end } : m;
      }),
    },
  });
  return { project: updated };
}

// Call after moving the project to a queued status. If the queue is
// unreachable, the project is marked FAILED so the user can retry instead of
// waiting forever on a job that doesn't exist.
export async function enqueueOrFail(projectId: string, name: PipelineJobName) {
  try {
    await enqueueProject(projectId, name);
  } catch (error) {
    console.error("Failed to enqueue", name, projectId, error);
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "FAILED",
        lastJob: name,
        errorParams: undefined,
        stage: null,
        error: "enqueue_failed",
      },
    });
  }
}
