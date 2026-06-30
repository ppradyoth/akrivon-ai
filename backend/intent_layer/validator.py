from __future__ import annotations

import re
from typing import Callable

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


def _luhn_valid(candidate: str) -> bool:
    digits = [int(c) for c in candidate if c.isdigit()]
    if not 13 <= len(digits) <= 16:
        return False
    total = 0
    for index, digit in enumerate(reversed(digits)):
        if index % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
    return total % 10 == 0


_PII_PATTERNS: list[tuple[str, re.Pattern[str], Callable[[str], bool] | None]] = [
    ("private_key", re.compile(r"-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----.*?-----END (?:[A-Z]+ )?PRIVATE KEY-----", re.S), None),
    ("jwt", re.compile(r"\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b"), None),
    ("email", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"), None),
    ("ssn", re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), None),
    ("credit_card", re.compile(r"\b(?:\d[ -]?){13,16}\b"), _luhn_valid),
    ("phone", re.compile(r"\b(?:\+?\d{1,2}[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b"), None),
    ("ip_address", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"), None),
    ("aws_access_key", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"), None),
    ("google_api_key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"), None),
    ("github_pat", re.compile(r"\bgithub_pat_[0-9A-Za-z_]{82}\b"), None),
    ("api_key", re.compile(r"\b(?:sk|pk|rk|gh[opsu]|xox[baprs])[-_][A-Za-z0-9]{16,}\b"), None),
]


def scan_output_pii(response: str) -> dict[str, object]:
    types: list[str] = []
    redacted = response
    redacted_count = 0
    for label, pattern, validator in _PII_PATTERNS:
        placeholder = f"[REDACTED_{label.upper()}]"
        count = 0

        def _replace(match: re.Match[str]) -> str:
            nonlocal count
            if validator is not None and not validator(match.group(0)):
                return match.group(0)
            count += 1
            return placeholder

        redacted = pattern.sub(_replace, redacted)
        if count:
            redacted_count += count
            if label not in types:
                types.append(label)
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
