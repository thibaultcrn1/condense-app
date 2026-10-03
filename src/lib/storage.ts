import "server-only";

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = requireEnv("S3_BUCKET");

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

function createClient(endpoint: string | undefined) {
  return new S3Client({
    endpoint: endpoint || undefined,
    region: process.env.S3_REGION ?? "auto",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
    // Default checksums bake a CRC of an empty body into presigned part URLs,
    // which makes browser uploads fail on non-AWS backends.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
  s3Public: S3Client | undefined;
};

// Server-to-storage traffic (e.g. http://storage:8333 inside docker compose).
const s3 = (globalForS3.s3 ??= createClient(process.env.S3_ENDPOINT));
// Presigned URLs embed the host in their signature, so they must be signed
// against the endpoint the browser reaches.
const s3Public = (globalForS3.s3Public ??= createClient(
  process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT,
));

const MIN_PART_SIZE = 64 * 1024 * 1024;
const MAX_PARTS = 10_000;
const UPLOAD_URL_TTL_SEC = 12 * 60 * 60;

export const MAX_SOURCE_SIZE = 100 * 1024 ** 3;

export function sourceKey(projectId: string, fileName: string) {
  const ext = fileName.match(/\.([a-z0-9]{1,5})$/i)?.[1]?.toLowerCase() ?? "mp4";
  return `projects/${projectId}/source.${ext}`;
}

export async function startMultipartUpload(
  key: string,
  size: number,
  contentType: string,
) {
  const partSize = Math.max(MIN_PART_SIZE, Math.ceil(size / MAX_PARTS));
  const partCount = Math.ceil(size / partSize);

  const { UploadId } = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
  );
  if (!UploadId) throw new Error("Storage did not return an upload id");

  const urls = await Promise.all(
    Array.from({ length: partCount }, (_, i) =>
      getSignedUrl(
        s3Public,
        new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId,
          PartNumber: i + 1,
        }),
        { expiresIn: UPLOAD_URL_TTL_SEC },
      ),
    ),
  );

  return { uploadId: UploadId, partSize, urls };
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[],
) {
  await s3.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: [...parts]
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
    }),
  );

  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  return { size: head.ContentLength ?? 0 };
}

export async function abortMultipartUpload(key: string, uploadId: string) {
  await s3.send(
    new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }),
  );
}

export async function deletePrefix(prefix: string) {
  let token: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    const keys = (page.Contents ?? []).flatMap((o) => (o.Key ? [{ Key: o.Key }] : []));
    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys } }),
      );
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
}

const DOWNLOAD_URL_TTL_SEC = 6 * 60 * 60;

// Read URL for the browser (video preview or download). With `downloadName`,
// the browser saves the file under that name instead of playing it.
export function presignedGet(key: string, downloadName?: string) {
  return getSignedUrl(
    s3Public,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: downloadName
        ? `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`
        : undefined,
    }),
    { expiresIn: DOWNLOAD_URL_TTL_SEC },
  );
}

export async function getJson(key: string): Promise<unknown> {
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return JSON.parse((await object.Body?.transformToString()) ?? "null");
}
