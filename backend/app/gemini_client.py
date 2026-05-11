from __future__ import annotations

import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import HTTPException


load_dotenv()

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro").strip()

if _GEMINI_API_KEY:
    genai.configure(api_key=_GEMINI_API_KEY)
    _model = genai.GenerativeModel(_GEMINI_MODEL)
else:
    _model = None


def llm(prompt: str) -> str:
    if _model is None:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    try:
        response = _model.generate_content(prompt)
    except Exception as exc:  # pragma: no cover - provider-specific
        raise HTTPException(status_code=502, detail=f"Gemini call failed: {exc}") from exc

    text = getattr(response, "text", None)
    if not text:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response")

    return text
