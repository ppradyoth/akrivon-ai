from __future__ import annotations

import uuid
from datetime import datetime, timezone

from firebase_admin import firestore


def _get_db():
    return firestore.client()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Scans ──

def create_scan_record(uid: str, config: dict) -> str:
    db = _get_db()
    scan_id = uuid.uuid4().hex
    db.collection("scans").document(scan_id).set({
        "uid": uid,
        "status": "running",
        "config": config,
        "summary": None,
        "violations": [],
        "created_at": _now(),
    })
    return scan_id


def update_scan_record(scan_id: str, status: str, summary: dict | None = None, violations: list | None = None):
    db = _get_db()
    update: dict = {"status": status}
    if summary is not None:
        update["summary"] = summary
    if violations is not None:
        update["violations"] = violations
    db.collection("scans").document(scan_id).update(update)


def get_scan(scan_id: str, uid: str) -> dict | None:
    db = _get_db()
    doc = db.collection("scans").document(scan_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    if data.get("uid") != uid:
        return None
    data["scan_id"] = scan_id
    return data


def list_scans_for_user(uid: str, limit: int = 50) -> list[dict]:
    db = _get_db()
    docs = (
        db.collection("scans")
        .where("uid", "==", uid)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["scan_id"] = doc.id
        results.append({
            "scan_id": doc.id,
            "status": data.get("status"),
            "summary": data.get("summary"),
            "config": data.get("config"),
            "created_at": data.get("created_at"),
        })
    return results


# ── Layers ──

def create_layer(uid: str, data: dict) -> str:
    db = _get_db()
    layer_id = uuid.uuid4().hex
    db.collection("layers").document(layer_id).set({
        "uid": uid,
        "name": data["name"],
        "target_url": data["target_url"],
        "intent_schema": data.get("intent_schema", {"categories": []}),
        "policy_rules": data.get("policy_rules", [{"default": "allow"}]),
        "created_at": _now(),
    })
    return layer_id


def get_layer(layer_id: str) -> dict | None:
    db = _get_db()
    doc = db.collection("layers").document(layer_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["layer_id"] = layer_id
    return data


def get_layer_for_user(layer_id: str, uid: str) -> dict | None:
    layer = get_layer(layer_id)
    if layer and layer.get("uid") == uid:
        return layer
    return None


def list_layers_for_user(uid: str) -> list[dict]:
    db = _get_db()
    docs = db.collection("layers").where("uid", "==", uid).stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["layer_id"] = doc.id
        results.append(data)
    return results


def update_layer(layer_id: str, uid: str, data: dict) -> bool:
    layer = get_layer_for_user(layer_id, uid)
    if not layer:
        return False
    db = _get_db()
    update = {}
    for key in ("name", "target_url", "intent_schema", "policy_rules"):
        if key in data:
            update[key] = data[key]
    if update:
        db.collection("layers").document(layer_id).update(update)
    return True


def delete_layer(layer_id: str, uid: str) -> bool:
    layer = get_layer_for_user(layer_id, uid)
    if not layer:
        return False
    _get_db().collection("layers").document(layer_id).delete()
    return True


def log_proxy_request(layer_id: str, data: dict):
    db = _get_db()
    db.collection("layers").document(layer_id).collection("requests").add({
        **data,
        "created_at": _now(),
    })


def list_proxy_requests(layer_id: str, uid: str, limit: int = 50) -> list[dict]:
    layer = get_layer_for_user(layer_id, uid)
    if not layer:
        return []
    db = _get_db()
    docs = (
        db.collection("layers").document(layer_id).collection("requests")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    return [{"request_id": doc.id, **doc.to_dict()} for doc in docs]
