import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { format, localizedPath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatDuration } from "@/lib/format";
import { getSessionUser, listProjectsForUser } from "@/lib/projects";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.pages.dashboard.title };
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const { app } = await getDictionary(locale);
  const user = (await getSessionUser())!;
  const projects = await listProjectsForUser(user.id);
  const href = (path: string) => localizedPath(locale, path);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{app.dashboard.title}</h1>
          <p className="text-muted-foreground">{format(app.dashboard.greeting, { name: user.name })}</p>
        </div>
        <Button nativeButton={false} render={<Link href={href("/dashboard/new")} />}>
          <Plus data-icon="inline-start" /> {app.dashboard.newProject}
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <p className="font-medium">{app.dashboard.emptyTitle}</p>
          <p className="text-muted-foreground max-w-sm text-sm">{app.dashboard.emptyText}</p>
          <Button className="mt-4" nativeButton={false} render={<Link href={href("/dashboard/new")} />}>
            <Plus data-icon="inline-start" /> {app.dashboard.newProject}
          </Button>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={href(`/dashboard/projects/${project.id}`)}
                className="hover:bg-muted/50 flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{project.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {project.durationSec
                      ? format(app.dashboard.liveOf, { duration: formatDuration(project.durationSec) })
                      : app.dashboard.importing}
                    {project.moments.length > 0
                      ? ` · ${format(app.dashboard.highlights, { count: project.moments.length })}`
                      : ""}
                  </p>
                </div>
                <ProjectStatusBadge status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
