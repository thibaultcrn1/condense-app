"use client";

import type { ProjectStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/client";

const VARIANTS: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_UPLOAD: "outline",
  QUEUED: "secondary",
  INGESTING: "secondary",
  INGESTED: "outline",
  ANALYZING: "secondary",
  REVIEW: "default",
  RENDERING: "secondary",
  DONE: "default",
  FAILED: "destructive",
};

export const ACTIVE_STATUSES: ProjectStatus[] = ["QUEUED", "INGESTING", "ANALYZING", "RENDERING"];

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useI18n();
  return <Badge variant={VARIANTS[status]}>{t.status[status]}</Badge>;
}
