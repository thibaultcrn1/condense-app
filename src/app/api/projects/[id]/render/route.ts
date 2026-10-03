import { prisma } from "@/lib/prisma";
import { applyEdit, EDITABLE_STATUSES, enqueueOrFail } from "@/lib/project-actions";
import { editSchema } from "@/lib/project-schema";
import { getProjectForUser, getSessionUser, toProjectDto } from "@/lib/projects";

export async function POST(request: Request, ctx: RouteContext<"/api/projects/[id]/render">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });
  if (!EDITABLE_STATUSES.includes(project.status)) {
    return Response.json({ error: "not_editable" }, { status: 409 });
  }

  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  if (parsed.data.montage.length === 0) {
    return Response.json({ error: "empty_montage" }, { status: 400 });
  }

  const result = await applyEdit(project, parsed.data);
  if (result.error) return Response.json({ error: result.error }, { status: 400 });

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { status: "RENDERING", stage: "queued", progress: 0, error: null },
  });
  await enqueueOrFail(project.id, "render");

  return Response.json({ project: await toProjectDto(updated) });
}
