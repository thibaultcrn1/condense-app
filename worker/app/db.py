import time
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo import MongoClient

from . import config

_client = MongoClient(config.DATABASE_URL)
# Database name comes from the connection string, as for Prisma.
_projects = _client.get_default_database()["project"]


def get_project(project_id: str) -> dict[str, Any] | None:
    if not ObjectId.is_valid(project_id):
        return None
    return _projects.find_one({"_id": ObjectId(project_id)})


def update_project(project_id: str, **fields: Any) -> None:
    # Prisma's @updatedAt is set client-side, so we maintain it ourselves.
    fields["updatedAt"] = datetime.now(timezone.utc)
    _projects.update_one({"_id": ObjectId(project_id)}, {"$set": fields})


class ProgressReporter:
    """Maps a step's own 0..1 progress onto a slice of the overall bar and
    throttles writes so ffmpeg/yt-dlp callbacks don't hammer MongoDB."""

    def __init__(self, project_id: str, min_interval: float = 2.0):
        self.project_id = project_id
        self.min_interval = min_interval
        self._last_write = 0.0

    def step(self, label: str, start: float, end: float):
        update_project(self.project_id, stage=label, progress=start)
        self._last_write = time.monotonic()

        def report(fraction: float) -> None:
            now = time.monotonic()
            if now - self._last_write < self.min_interval:
                return
            self._last_write = now
            fraction = min(max(fraction, 0.0), 1.0)
            update_project(self.project_id, progress=start + (end - start) * fraction)

        return report


def fail_interrupted(statuses: list[str], message: str) -> list[str]:
    """Marks projects left mid-processing as FAILED and returns their ids."""
    ids = [str(p["_id"]) for p in _projects.find({"status": {"$in": statuses}}, {"_id": 1})]
    if ids:
        _projects.update_many(
            {"_id": {"$in": [ObjectId(i) for i in ids]}},
            {"$set": {"status": "FAILED", "error": message, "stage": None,
                      "updatedAt": datetime.now(timezone.utc)}},
        )
    return ids
