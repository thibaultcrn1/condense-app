import { prisma } from "@/lib/prisma";
import { enqueueOrFail } from "@/lib/project-actions";
import { getProjectForUser, getSessionUser, toProjectDto } from "@/lib/projects";

export async function POST(_request: Request, ctx: RouteContext<"/api/projects/[id]/retry">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });
  if (project.status !== "FAILED" && project.status !== "INGESTED") {
    return Response.json({ error: "nothing_to_retry" }, { status: 409 });
  }

  // The worker resumes from the last completed stage.
  const job = project.lastJob === "render" ? "render" : "process";
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      status: job === "render" ? "RENDERING" : "QUEUED",
      stage: null,
      progress: 0,
      error: null,
      errorParams: undefined,
    },
  });
  await enqueueOrFail(project.id, job);

  return Response.json({ project: await toProjectDto(updated) });
}
