from __future__ import annotations

import re
import unicodedata
from typing import Callable

_MAX_SAFE_LENGTH = 10_000

# Invisible / zero-width characters attackers splice inside keywords to defeat
# literal matching: "i​gnore previous instructions" renders identically to a
# human but breaks the regex token. Stripped before scanning, paired with an NFKC
# fold that collapses fullwidth and other compatibility homoglyphs back to ASCII.
_INVISIBLE_CHARS = dict.fromkeys(
    [0x200B, 0x200C, 0x200D, 0x200E, 0x200F, 0x2060, 0xFEFF, 0x00AD]
)

# Cyrillic and Greek homoglyphs of Latin letters. NFKC does NOT fold these — a
# Cyrillic "о" (U+043E) and a Latin "o" are distinct codepoints under any
# normalization form — so "ignоre previous instructions" (one Cyrillic letter)
# sails past every injection pattern. This curated map of the confusables that
# appear in the injection keywords folds them back to ASCII before matching.
_CONFUSABLES = {
    # Cyrillic lowercase → Latin
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x",
    "і": "i", "ј": "j", "ѕ": "s", "ԁ": "d", "һ": "h", "ԛ": "q", "ѡ": "w",
    "т": "t",
    # Cyrillic uppercase → Latin
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O",
    "Р": "P", "С": "C", "Т": "T", "Х": "X", "У": "Y", "І": "I", "Ѕ": "S",
    "Ј": "J",
    # Greek lowercase → Latin
    "α": "a", "ο": "o", "ρ": "p", "ε": "e", "ι": "i", "ν": "v", "υ": "u",
    "κ": "k", "τ": "t",
    # Greek uppercase → Latin
    "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K",
    "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X",
}
_CONFUSABLES_TABLE = str.maketrans(_CONFUSABLES)


def _normalize_for_scan(text: str) -> str:
    folded = text.translate(_INVISIBLE_CHARS).translate(_CONFUSABLES_TABLE)
    return unicodedata.normalize("NFKC", folded)

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
    prompt = _normalize_for_scan(prompt)
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
    ("slack_webhook", re.compile(r"https://hooks\.slack\.com/services/T[A-Za-z0-9]+/B[A-Za-z0-9]+/[A-Za-z0-9]+"), None),
    ("slack_token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"), None),
    ("email", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"), None),
    ("ssn", re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), None),
    ("credit_card", re.compile(r"\b(?:\d[ -]?){13,16}\b"), _luhn_valid),
    ("phone", re.compile(r"\b(?:\+?\d{1,2}[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b"), None),
    ("ip_address", re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b"), None),
    ("aws_access_key", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"), None),
    ("google_api_key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"), None),
    ("github_pat", re.compile(r"\bgithub_pat_[0-9A-Za-z_]{82}\b"), None),
    ("npm_token", re.compile(r"\bnpm_[A-Za-z0-9]{36}\b"), None),
    ("stripe_key", re.compile(r"\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b"), None),
    ("gitlab_pat", re.compile(r"\bglpat-[A-Za-z0-9_-]{20}\b"), None),
    ("sendgrid_key", re.compile(r"\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b"), None),
    ("twilio_key", re.compile(r"\bSK[0-9a-fA-F]{32}\b"), None),
    ("anthropic_api_key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b"), None),
    ("openai_api_key", re.compile(r"\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}\b"), None),
    ("huggingface_token", re.compile(r"\bhf_[0-9A-Za-z]{34}\b"), None),
    ("replicate_token", re.compile(r"\br8_[A-Za-z0-9]{35,40}\b"), None),
    ("perplexity_api_key", re.compile(r"\bpplx-[A-Za-z0-9]{48}\b"), None),
    ("postman_api_key", re.compile(r"\bPMAK-[a-fA-F0-9]{24}-[a-fA-F0-9]{34}\b"), None),
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
    normalized = _normalize_for_scan(response)
    for category, patterns in _PATTERN_GROUPS:
        for pattern in patterns:
            if pattern.search(normalized):
                return {
                    "safe": False,
                    "category": category,
                    "reason": f"Response matched a {category.replace('_', ' ')} pattern.",
                }
    return {"safe": True, "category": None, "reason": None}
