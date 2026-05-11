from __future__ import annotations

import re

_MAX_SAFE_LENGTH = 10_000

# Patterns that suggest the response itself is attempting prompt injection or role subversion
_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.I),
    re.compile(r"disregard\s+(all\s+)?previous\s+(instructions|context)", re.I),
    re.compile(r"you\s+are\s+now\s+(a\s+)?(dan|jailbreak|evil|uncensored|unfiltered)", re.I),
    re.compile(r"new\s+instructions?\s*:", re.I),
    re.compile(r"\[system\s*\]", re.I),
    re.compile(r"<\|?system\|?>", re.I),
]


def validate_response(response: str) -> dict[str, bool]:
    if len(response) > _MAX_SAFE_LENGTH:
        return {"safe": False}
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(response):
            return {"safe": False}
    return {"safe": True}
