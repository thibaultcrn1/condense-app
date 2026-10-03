import { z } from "zod";

export const TWITCH_VOD_URL = /^https:\/\/(www\.|m\.)?twitch\.tv\/videos\/(\d+)/;

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  source: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("upload"),
      fileName: z.string().min(1).max(255),
      fileSize: z.number().int().positive(),
      contentType: z.string().regex(/^video\//),
    }),
    z.object({
      type: z.literal("twitch"),
      url: z.string().regex(TWITCH_VOD_URL),
    }),
  ]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const completeUploadSchema = z.object({
  parts: z
    .array(
      z.object({
        partNumber: z.number().int().min(1).max(10_000),
        etag: z.string().min(1).max(200),
      }),
    )
    .min(1),
});

// The editor state: highlight ids in montage order, and each highlight's
// adjusted bounds in seconds.
export const editSchema = z.object({
  montage: z.array(z.string().max(20)).max(5000),
  bounds: z
    .array(
      z.object({
        id: z.string().max(20),
        start: z.number().min(0),
        end: z.number().min(0),
      }),
    )
    .max(5000),
});

export type EditInput = z.infer<typeof editSchema>;
