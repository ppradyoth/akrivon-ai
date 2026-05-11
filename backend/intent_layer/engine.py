from __future__ import annotations

from typing import Callable

from .classifier import classify_intent
from .policy import evaluate_policy
from .router import route_decision
from .validator import validate_response

_BLOCKED_BY_VALIDATOR = (
    "This response has been withheld because it did not pass the safety validator."
)


def enforce(prompt: str, config: dict[str, list[str]], call_api: Callable[[str], str]) -> dict[str, object]:
    intent = classify_intent(prompt)

    decision = evaluate_policy(
        intent_label=str(intent["label"]),
        allowed=config.get("allowed", []),
        blocked=config.get("blocked", []),
    )

    response = route_decision(decision=decision, prompt=prompt, call_api=call_api)
    validation = validate_response(response)

    if not validation["safe"]:
        response = _BLOCKED_BY_VALIDATOR

    return {
        "intent": {
            "label": str(intent["label"]),
            "confidence": float(intent["confidence"]),
        },
        "decision": decision,
        "response": response,
        "validation": validation,
    }
