from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
from firebase_admin import auth as firebase_auth, firestore


def _get_db():
    return firestore.client()


def _extract_token(request: Request) -> str:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")
    return header[7:]


async def get_current_user(request: Request) -> dict:
    token = _extract_token(request)

    # API key path: ak_live_<hex>
    if token.startswith("ak_live_"):
        return _resolve_api_key(token)

    # Firebase JWT path
    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {"uid": decoded["uid"], "email": decoded.get("email"), "auth_type": "jwt"}


def _resolve_api_key(raw_key: str) -> dict:
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    db = _get_db()
    doc = db.collection("api_keys").document(key_hash).get()
    if not doc.exists:
        raise HTTPException(status_code=401, detail="Invalid API key")

    data = doc.to_dict()
    db.collection("api_keys").document(key_hash).update(
        {"last_used_at": datetime.now(timezone.utc).isoformat()}
    )
    return {"uid": data["uid"], "email": data.get("email"), "auth_type": "api_key"}


def create_api_key(uid: str, name: str) -> dict:
    raw_key = f"ak_live_{secrets.token_hex(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    now = datetime.now(timezone.utc).isoformat()

    db = _get_db()
    db.collection("api_keys").document(key_hash).set({
        "uid": uid,
        "name": name,
        "created_at": now,
        "last_used_at": None,
    })

    return {"key": raw_key, "key_id": key_hash, "name": name, "created_at": now}


def list_api_keys(uid: str) -> list[dict]:
    db = _get_db()
    docs = db.collection("api_keys").where("uid", "==", uid).stream()
    keys = []
    for doc in docs:
        data = doc.to_dict()
        keys.append({
            "key_id": doc.id,
            "name": data.get("name", ""),
            "created_at": data.get("created_at"),
            "last_used_at": data.get("last_used_at"),
        })
    return keys


def delete_api_key(uid: str, key_id: str) -> None:
    db = _get_db()
    doc = db.collection("api_keys").document(key_id).get()
    if not doc.exists or doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=404, detail="API key not found")
    db.collection("api_keys").document(key_id).delete()
