import json
from pathlib import Path
from typing import Callable

import boto3
from boto3.s3.transfer import TransferConfig
from botocore.config import Config

from . import config

_s3 = boto3.client(
    "s3",
    endpoint_url=config.S3_ENDPOINT,
    region_name=config.S3_REGION,
    aws_access_key_id=config.S3_ACCESS_KEY_ID,
    aws_secret_access_key=config.S3_SECRET_ACCESS_KEY,
    config=Config(
        s3={"addressing_style": "path" if config.S3_FORCE_PATH_STYLE else "auto"},
        # Same reason as in src/lib/storage.ts: non-AWS backends reject the
        # newer default checksum headers.
        request_checksum_calculation="when_required",
        response_checksum_validation="when_required",
    ),
)

_transfer = TransferConfig(multipart_chunksize=64 * 1024 * 1024, max_concurrency=8)


def presigned_get(key: str, expires_sec: int = 12 * 3600) -> str:
    """URL ffmpeg can read directly, so large sources are streamed rather than
    copied to local disk first."""
    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": config.S3_BUCKET, "Key": key},
        ExpiresIn=expires_sec,
    )


def upload_file(
    path: Path,
    key: str,
    content_type: str,
    on_progress: Callable[[float], None] | None = None,
) -> None:
    total = path.stat().st_size or 1
    sent = 0

    def callback(bytes_amount: int) -> None:
        nonlocal sent
        sent += bytes_amount
        if on_progress:
            on_progress(sent / total)

    _s3.upload_file(
        str(path),
        config.S3_BUCKET,
        key,
        ExtraArgs={"ContentType": content_type},
        Config=_transfer,
        Callback=callback,
    )


def download_file(key: str, path: Path) -> None:
    _s3.download_file(config.S3_BUCKET, key, str(path), Config=_transfer)


def put_json(key: str, data) -> None:
    _s3.put_object(
        Bucket=config.S3_BUCKET,
        Key=key,
        Body=json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode(),
        ContentType="application/json",
    )


def get_json(key: str):
    return json.loads(_s3.get_object(Bucket=config.S3_BUCKET, Key=key)["Body"].read())


def delete_prefix(prefix: str) -> None:
    paginator = _s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=config.S3_BUCKET, Prefix=prefix):
        keys = [{"Key": o["Key"]} for o in page.get("Contents", [])]
        if keys:
            _s3.delete_objects(Bucket=config.S3_BUCKET, Delete={"Objects": keys})
