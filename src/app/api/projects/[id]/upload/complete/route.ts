import { prisma } from "@/lib/prisma";
import { enqueueOrFail } from "@/lib/project-actions";
import { completeUploadSchema } from "@/lib/project-schema";
import { getProjectForUser, getSessionUser, toProjectDto } from "@/lib/projects";
import { completeMultipartUpload } from "@/lib/storage";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/projects/[id]/upload/complete">,
) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });
  if (project.status !== "PENDING_UPLOAD" || !project.uploadId || !project.sourceKey) {
    return Response.json({ error: "no_upload" }, { status: 409 });
  }

  const parsed = completeUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const { size } = await completeMultipartUpload(
    project.sourceKey,
    project.uploadId,
    parsed.data.parts,
  );

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { uploadId: null, sourceSize: size, status: "QUEUED", stage: null, progress: 0 },
  });
  await enqueueOrFail(project.id, "process");

  return Response.json({ project: await toProjectDto(updated) });
}
