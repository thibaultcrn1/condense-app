import { getProjectForUser, getSessionUser } from "@/lib/projects";
import { getJson } from "@/lib/storage";

// Safe cut intervals ([start, end] pauses between words) for snapping edits.
export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]/cutpoints">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });

  const intervals = project.cutpointsKey ? await getJson(project.cutpointsKey) : [];
  return Response.json({ intervals }, { headers: { "Cache-Control": "private, max-age=3600" } });
}
