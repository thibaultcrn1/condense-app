import { prisma } from "@/lib/prisma";
import { enqueueOrFail } from "@/lib/project-actions";
import { createProjectSchema } from "@/lib/project-schema";
import { getSessionUser, toProjectDto } from "@/lib/projects";
import { MAX_SOURCE_SIZE, sourceKey, startMultipartUpload } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = createProjectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.some((i) => i.path.includes("url")) ? "invalid_twitch_url" : "invalid_request" },
      { status: 400 },
    );
  }
  const { title, source } = parsed.data;

  if (source.type === "upload" && source.fileSize > MAX_SOURCE_SIZE) {
    return Response.json({ error: "file_too_large" }, { status: 413 });
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title,
      sourceType: source.type === "upload" ? "UPLOAD" : "TWITCH",
      sourceUrl: source.type === "twitch" ? source.url : undefined,
      sourceFileName: source.type === "upload" ? source.fileName : undefined,
      sourceSize: source.type === "upload" ? source.fileSize : undefined,
      status: source.type === "upload" ? "PENDING_UPLOAD" : "QUEUED",
    },
  });

  if (source.type === "twitch") {
    await enqueueOrFail(project.id, "process");
    return Response.json({ project: await toProjectDto(project) }, { status: 201 });
  }

  const key = sourceKey(project.id, source.fileName);
  try {
    const upload = await startMultipartUpload(key, source.fileSize, source.contentType);
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { sourceKey: key, uploadId: upload.uploadId },
    });
    return Response.json(
      {
        project: await toProjectDto(updated),
        upload: { partSize: upload.partSize, urls: upload.urls },
      },
      { status: 201 },
    );
  } catch (error) {
    await prisma.project.delete({ where: { id: project.id } });
    throw error;
  }
}
