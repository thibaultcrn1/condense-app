import { prisma } from "@/lib/prisma";
import { BUSY_STATUSES } from "@/lib/project-actions";
import { getProjectForUser, getSessionUser, toProjectDto } from "@/lib/projects";
import { abortMultipartUpload, deletePrefix } from "@/lib/storage";

export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });

  return Response.json({ project: await toProjectDto(project) });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });

  if (BUSY_STATUSES.includes(project.status) && project.status !== "QUEUED") {
    return Response.json(
      { error: "busy" },
      { status: 409 },
    );
  }

  if (project.uploadId && project.sourceKey) {
    await abortMultipartUpload(project.sourceKey, project.uploadId).catch(() => {});
  }
  await deletePrefix(`projects/${project.id}/`);
  await prisma.project.delete({ where: { id: project.id } });

  return new Response(null, { status: 204 });
}
