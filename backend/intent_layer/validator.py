from __future__ import annotations

import re

_MAX_SAFE_LENGTH = 10_000

# Categorized patterns that suggest the response is attempting prompt injection,
# role subversion, or system-prompt exfiltration
_PATTERN_GROUPS: list[tuple[str, list[re.Pattern[str]]]] = [
    (
        "instruction_override",
        [
            re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", re.I),
            re.compile(r"disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|context)", re.I),
            re.compile(r"forget\s+(everything|all)\s+(you\s+were\s+)?(told|instructed)", re.I),
            re.compile(r"new\s+instructions?\s*:", re.I),
            re.compile(r"override\s+(the\s+)?(system|safety)\s+(prompt|settings|guidelines)", re.I),
        ],
    ),
    (
        "jailbreak_persona",
        [
            re.compile(r"you\s+are\s+now\s+(a\s+)?(dan|jailbreak|evil|uncensored|unfiltered)", re.I),
            re.compile(r"\bdo\s+anything\s+now\b", re.I),
            re.compile(r"\b(developer|debug|god)\s+mode\s+(enabled|engaged|activated|on)\b", re.I),
            re.compile(r"as\s+an\s+(unfiltered|uncensored|unrestricted)\s+(ai|assistant|model)", re.I),
            re.compile(r"without\s+any\s+(restrictions|filters|guidelines|limitations)", re.I),
        ],
    ),
    (
        "system_spoofing",
        [
            re.compile(r"\[system\s*\]", re.I),
            re.compile(r"<\|?(system|im_start|im_end)\|?>", re.I),
            re.compile(r"#{2,}\s*system\b", re.I),
            re.compile(r"\bsystem\s+prompt\s*:", re.I),
        ],
    ),
    (
        "prompt_extraction",
        [
            re.compile(r"(reveal|print|repeat|show|display|output)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions)", re.I),
            re.compile(r"repeat\s+(the\s+)?(text|words)\s+above", re.I),
            re.compile(r"what\s+(were|are)\s+your\s+(original|initial|system)\s+instructions", re.I),
        ],
    ),
]


def scan_input(prompt: str) -> dict[str, object]:
    for category, patterns in _PATTERN_GROUPS:
        for pattern in patterns:
            if pattern.search(prompt):
                return {
                    "flagged": True,
                    "category": category,
                    "reason": f"Input matched a {category.replace('_', ' ')} pattern.",
                }
    return {"flagged": False, "category": None, "reason": None}


_PII_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("email", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")),
    ("ssn", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("credit_card", re.compile(r"\b(?:\d[ -]?){13,16}\b")),
    ("phone", re.compile(r"\b(?:\+?\d{1,2}[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b")),
    ("ip_address", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
    ("aws_access_key", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("api_key", re.compile(r"\b(?:sk|pk|rk|gh[opsu]|xox[baprs])[-_][A-Za-z0-9]{16,}\b")),
]


def scan_output_pii(response: str) -> dict[str, object]:
    types: list[str] = []
    redacted = response
    redacted_count = 0
    for label, pattern in _PII_PATTERNS:
        matches = pattern.findall(redacted)
        if matches:
            redacted_count += len(matches)
            if label not in types:
                types.append(label)
            redacted = pattern.sub(f"[REDACTED_{label.upper()}]", redacted)
    return {
        "filtered": redacted_count > 0,
        "types": types,
        "redacted_count": redacted_count,
        "redacted": redacted,
    }


def validate_response(response: str) -> dict[str, object]:
    if len(response) > _MAX_SAFE_LENGTH:
        return {
            "safe": False,
            "category": "length",
            "reason": f"Response exceeds the {_MAX_SAFE_LENGTH}-character safety limit.",
        }
    for category, patterns in _PATTERN_GROUPS:
        for pattern in patterns:
            if pattern.search(response):
                return {
                    "safe": False,
                    "category": category,
                    "reason": f"Response matched a {category.replace('_', ' ')} pattern.",
                }
    return {"safe": True, "category": None, "reason": None}
