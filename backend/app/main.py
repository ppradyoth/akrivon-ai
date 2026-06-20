from __future__ import annotations

import asyncio
import os

import httpx
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from intent_layer.engine import enforce
from .auth import create_api_key, delete_api_key, get_current_user, list_api_keys
from .engine import run_scan
from .models import EnforceRequest, EnforceResponse, ScanConfig, ScanResponse
from .security import assert_safe_url

_MAX_RESPONSE_CHARS = 32_768

app = FastAPI(title="AkrivonAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/scan", response_model=ScanResponse)
async def scan(config: ScanConfig, user: dict = Depends(get_current_user)) -> ScanResponse:
    return await run_scan(config)


def _call_runtime_target_api(target_url: str, prompt: str) -> str:

    payload_options = [
        {"prompt": prompt},
        {"message": prompt},
        {"input": prompt},
        {"query": prompt},
    ]

    with httpx.Client(timeout=httpx.Timeout(20.0, connect=10.0)) as client:
        for payload in payload_options:
            try:
                resp = client.post(target_url, json=payload)
                if resp.status_code >= 400:
                    continue

                content_type = resp.headers.get("content-type", "")
                if "application/json" in content_type:
                    body = resp.json()
                    if isinstance(body, dict):
                        for key in ["response", "output", "text", "message", "answer", "result"]:
                            value = body.get(key)
                            if isinstance(value, str) and value.strip():
                                return value.strip()[:_MAX_RESPONSE_CHARS]
                    return str(body)[:_MAX_RESPONSE_CHARS]

                text = resp.text.strip()
                if text:
                    return text[:_MAX_RESPONSE_CHARS]
            except Exception:
                continue

    return "Request allowed by intent policy, but runtime target API did not return a usable response."


@app.post("/enforce", response_model=EnforceResponse)
async def enforce_route(payload: EnforceRequest, user: dict = Depends(get_current_user)) -> EnforceResponse:
    target_url = (str(payload.target_api).strip() if payload.target_api else "") or os.getenv("INTENT_TARGET_API_URL", "").strip()

    if target_url:
        assert_safe_url(target_url)

    def _proxy_call(prompt: str) -> str:
        if not target_url:
            return "Request allowed by intent policy. No runtime target API is configured."
        return _call_runtime_target_api(target_url=target_url, prompt=prompt)

    config = {
        "allowed": payload.config.allowed,
        "blocked": payload.config.blocked,
    }

    # enforce() and its call_api callback are synchronous (blocking httpx); run in thread pool
    # to avoid stalling the event loop.
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: enforce(prompt=payload.prompt, config=config, call_api=_proxy_call),
    )
    return EnforceResponse.model_validate(result)


class CreateApiKeyRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


@app.post("/api-keys")
async def create_key(body: CreateApiKeyRequest, user: dict = Depends(get_current_user)):
    return create_api_key(uid=user["uid"], name=body.name)


@app.get("/api-keys")
async def list_keys(user: dict = Depends(get_current_user)):
    return list_api_keys(uid=user["uid"])


@app.delete("/api-keys/{key_id}")
async def delete_key(key_id: str, user: dict = Depends(get_current_user)):
    delete_api_key(uid=user["uid"], key_id=key_id)
    return {"status": "deleted"}
