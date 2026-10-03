import asyncio
import logging
import shutil
import signal

from bullmq import Worker

from . import config, db, pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("worker")


async def process(job, _token):
    project_id = job.data["projectId"]
    log.info("Running %s for project %s", job.name, project_id)
    # The pipeline blocks on ffmpeg/yt-dlp for a long time; running it off the
    # event loop keeps BullMQ's lock renewal alive so the job isn't re-queued
    # as stalled mid-run.
    await asyncio.to_thread(pipeline.run, job.name, project_id)
    log.info("Done with %s for project %s", job.name, project_id)


async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)

    # A single worker runs one job at a time, so any project still "in
    # progress" at startup was interrupted by a crash (typically the kernel
    # killing us for lack of memory). Fail it so the user can retry, rather
    # than letting BullMQ replay a job that will crash the same way. With
    # several workers this would need per-job heartbeats instead.
    interrupted = db.fail_interrupted(
        ["INGESTING", "ANALYZING", "RENDERING"],
        "interrupted",
    )
    if interrupted:
        log.warning("Marked interrupted projects as failed: %s", interrupted)

    # Same reasoning: leftover work directories belong to interrupted jobs
    # and can weigh tens of GB (a half-downloaded VOD).
    if config.WORK_DIR.exists():
        for leftover in config.WORK_DIR.iterdir():
            shutil.rmtree(leftover, ignore_errors=True)
            log.info("Removed leftover work directory %s", leftover.name)

    worker = Worker(
        config.PIPELINE_QUEUE,
        process,
        {"connection": config.REDIS_URL, "concurrency": 1},
    )
    log.info("Worker listening on queue %r", config.PIPELINE_QUEUE)
    await stop.wait()
    log.info("Shutting down")
    await worker.close()


if __name__ == "__main__":
    asyncio.run(main())
