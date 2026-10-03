import "server-only";

import { Queue } from "bullmq";
import IORedis from "ioredis";

// Consumed by the Python worker in /worker; keep the name and payload in sync
// with worker/app/main.py.
export const PIPELINE_QUEUE = "pipeline";

// "process": ingest + analysis, ends in REVIEW. "render": builds the videos.
export type PipelineJobName = "process" | "render";
export type PipelineJob = { projectId: string };

const globalForQueue = globalThis as unknown as {
  pipelineQueue: Queue<PipelineJob> | undefined;
};

const pipelineQueue = (globalForQueue.pipelineQueue ??= new Queue<PipelineJob>(
  PIPELINE_QUEUE,
  {
    // BullMQ requires maxRetriesPerRequest: null on its connections.
    connection: new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    }),
  },
));

export async function enqueueProject(projectId: string, name: PipelineJobName = "process") {
  // jobId dedupes: a project can't have two pending jobs of the same kind. It
  // includes the kind so a leftover "process" job never swallows a "render".
  await pipelineQueue.add(
    name,
    { projectId },
    { jobId: `${projectId}-${name}`, removeOnComplete: true, removeOnFail: true },
  );
}
