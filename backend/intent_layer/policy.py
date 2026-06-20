from __future__ import annotations


def evaluate_policy(
    intent_label: str,
    allowed: list[str] | None = None,
    blocked: list[str] | None = None,
    rules: list[dict] | None = None,
    confidence: float = 1.0,
) -> str:
    if rules:
        return _evaluate_rules(intent_label, confidence, rules)

    allowed = allowed or []
    blocked = blocked or []
    if intent_label in blocked:
        return "block"
    if intent_label in allowed:
        return "allow"
    return "clarify"


def _evaluate_rules(intent_label: str, confidence: float, rules: list[dict]) -> str:
    for rule in rules:
        if "default" in rule:
            return rule["default"]

        when = rule.get("when", {})
        if not _matches(when, intent_label, confidence):
            continue
        return rule.get("then", "clarify")

    return "allow"


def _matches(when: dict, intent_label: str, confidence: float) -> bool:
    if "intent" in when and when["intent"] != intent_label:
        return False
    if "intent_in" in when and intent_label not in when["intent_in"]:
        return False
    if "intent_not_in" in when and intent_label in when["intent_not_in"]:
        return False
    if "confidence_gte" in when and confidence < float(when["confidence_gte"]):
        return False
    if "confidence_lt" in when and confidence >= float(when["confidence_lt"]):
        return False
    return True
