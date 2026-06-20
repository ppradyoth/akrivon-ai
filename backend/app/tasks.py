from __future__ import annotations

import json
import os

from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2

_QUEUE = os.getenv("CLOUD_TASKS_QUEUE", "akrivon-scans")
_LOCATION = os.getenv("CLOUD_TASKS_LOCATION", "us-central1")
_PROJECT = os.getenv("GCP_PROJECT", "")
_WORKER_URL = os.getenv("SCAN_WORKER_URL", "")


def enqueue_scan_job(scan_id: str, config: dict, uid: str) -> str:
    if not _PROJECT or not _WORKER_URL:
        return ""

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(_PROJECT, _LOCATION, _QUEUE)

    payload = json.dumps({"scan_id": scan_id, "config": config, "uid": uid}).encode()

    task = tasks_v2.Task(
        http_request=tasks_v2.HttpRequest(
            http_method=tasks_v2.HttpMethod.POST,
            url=f"{_WORKER_URL}/scan/worker/{scan_id}",
            headers={"Content-Type": "application/json"},
            body=payload,
        )
    )

    response = client.create_task(parent=parent, task=task)
    return response.name
