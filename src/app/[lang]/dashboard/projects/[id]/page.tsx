import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetails } from "@/components/project-details";
import { getProjectForUser, getSessionUser, toProjectDto } from "@/lib/projects";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/projects/[id]">): Promise<Metadata> {
  const user = await getSessionUser();
  const project = user ? await getProjectForUser((await params).id, user.id) : null;
  return { title: project?.title };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/dashboard/projects/[id]">) {
  const user = (await getSessionUser())!;
  const project = await getProjectForUser((await params).id, user.id);
  if (!project) notFound();

  return <ProjectDetails initialProject={await toProjectDto(project)} />;
}
