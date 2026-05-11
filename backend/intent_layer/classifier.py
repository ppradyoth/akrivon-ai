from __future__ import annotations

import json
import re

from ..app.gemini_client import llm


def classify_intent(prompt: str) -> dict[str, float | str]:
    if not prompt.strip():
        return {"label": "unknown", "confidence": 0.5}

    classification_prompt = f"""Classify the user's intent based on their prompt. Return STRICT JSON only.

Available intent categories:
- general_coding: questions about software development, architecture, design patterns, debugging
- financial_advice: questions about investments, loans, interest rates, financial planning
- payments_api_help: questions about payment APIs, transaction processing, payment integration
- general_knowledge: other general knowledge questions
- unclear: unable to classify

User prompt:
"{prompt}"

Return STRICT JSON (no markdown, no explanation):
{{"label": "category_name", "confidence": 0.0-1.0}}

confidence must be between 0 and 1, reflecting how certain you are about the classification.""".strip()

    try:
        raw = llm(classification_prompt)
        match = re.search(r'\{[^{}]*\}', raw)
        if not match:
            return {"label": "unknown", "confidence": 0.3}

        parsed = json.loads(match.group(0))
        label = str(parsed.get("label", "unknown")).lower().strip()
        confidence = float(parsed.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))

        return {"label": label, "confidence": confidence}
    except Exception:
        return {"label": "unknown", "confidence": 0.3}
