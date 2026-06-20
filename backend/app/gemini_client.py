from __future__ import annotations

import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import HTTPException


load_dotenv()

_model = None


def _get_model():
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
        _model = genai.GenerativeModel(model_name)
    return _model


def llm(prompt: str) -> str:
    model = _get_model()

    try:
        response = model.generate_content(prompt)
    except Exception as exc:  # pragma: no cover - provider-specific
        raise HTTPException(status_code=502, detail=f"Gemini call failed: {exc}") from exc

    text = getattr(response, "text", None)
    if not text:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response")

    return text
