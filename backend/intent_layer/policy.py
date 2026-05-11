from __future__ import annotations


def evaluate_policy(intent_label: str, allowed: list[str], blocked: list[str]) -> str:
    if intent_label in blocked:
        return "block"

    if intent_label in allowed:
        return "allow"

    return "clarify"
