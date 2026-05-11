from __future__ import annotations

from typing import Callable


def route_decision(decision: str, prompt: str, call_api: Callable[[str], str]) -> str:
    if decision == "block":
        return (
            "I cannot help with that request in this context. "
            "Please ask a question related to the supported product scope."
        )

    if decision == "clarify":
        return (
            "I need a bit more context before proceeding. "
            "Please clarify if your request is related to the allowed use case."
        )

    try:
        return call_api(prompt)
    except Exception:
        return "Request is allowed by policy, but the runtime target API is unavailable right now."
