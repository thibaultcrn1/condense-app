import { applyEdit, EDITABLE_STATUSES } from "@/lib/project-actions";
import { editSchema } from "@/lib/project-schema";
import { getProjectForUser, getSessionUser } from "@/lib/projects";

// Autosave of the editor: montage order and highlight bounds.
export async function PUT(request: Request, ctx: RouteContext<"/api/projects/[id]/edit">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });
  if (!EDITABLE_STATUSES.includes(project.status)) {
    return Response.json({ error: "not_editable" }, { status: 409 });
  }

  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const result = await applyEdit(project, parsed.data);
  if (result.error) return Response.json({ error: result.error }, { status: 400 });
  return new Response(null, { status: 204 });
}
