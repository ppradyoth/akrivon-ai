from __future__ import annotations

import os
import sys

# Make the backend package importable when Firebase runs this as the source root.
sys.path.insert(0, os.path.dirname(__file__))

from firebase_functions import https_fn
from firebase_functions.params import SecretParam
from firebase_admin import initialize_app
from a2wsgi import ASGIMiddleware
from flask import Response
from app.main import app as fastapi_app

initialize_app()
_wsgi = ASGIMiddleware(fastapi_app)

GEMINI_API_KEY = SecretParam("GEMINI_API_KEY")


@https_fn.on_request(region="us-central1", secrets=[GEMINI_API_KEY])
def api(req: https_fn.Request) -> Response:
    # Firebase Hosting rewrites /api/** to this function but keeps the full
    # path (e.g. /api/scan). Strip the prefix so FastAPI routes match.
    environ = req.environ.copy()
    path: str = environ.get("PATH_INFO", "")
    if path.startswith("/api"):
        environ["SCRIPT_NAME"] = environ.get("SCRIPT_NAME", "") + "/api"
        environ["PATH_INFO"] = path[len("/api"):] or "/"

    captured: dict[str, object] = {}
    chunks: list[bytes] = []

    def start_response(status: str, headers: list[tuple[str, str]], exc_info=None):
        captured["status"] = int(status.split(" ", 1)[0])
        captured["headers"] = dict(headers)

    for chunk in _wsgi(environ, start_response):
        chunks.append(chunk if isinstance(chunk, bytes) else chunk.encode())

    return Response(
        response=b"".join(chunks),
        status=captured.get("status", 500),
        headers=captured.get("headers", {}),
    )
