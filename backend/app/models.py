from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class StrategyName(str, Enum):
    role_transformation = "RoleTransformation"
    gradual_drift = "GradualDrift"
    language_variation = "LanguageVariation"


class ScanConfig(BaseModel):
    api_url: HttpUrl
    use_case: str = Field(min_length=10, max_length=4000)
    allowed_capabilities: list[str] = Field(default_factory=list)
    disallowed_capabilities: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=lambda: ["English"])
    num_tests: int = Field(ge=1, le=200)


class Analysis(BaseModel):
    violation: bool
    type: Literal["capability_drift", "role_drift", "domain_violation", "none"]
    severity: Literal["low", "medium", "high", "critical"]
    reason: str
    confidence: float = Field(ge=0.0, le=1.0)


class ViolationRecord(BaseModel):
    strategy: StrategyName
    prompt: str
    response: str
    analysis: Analysis


class Summary(BaseModel):
    total_tests: int
    violations: int
    risk_score: float = Field(ge=0.0, le=100.0)


class ScanResponse(BaseModel):
    summary: Summary
    violations: list[ViolationRecord]


class IntentLayerConfig(BaseModel):
    allowed: list[str] = Field(default_factory=list)
    blocked: list[str] = Field(default_factory=list)


class EnforceRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10000)
    target_api: HttpUrl
    config: IntentLayerConfig


class IntentResult(BaseModel):
    label: str
    confidence: float = Field(ge=0.0, le=1.0)


class ValidationResult(BaseModel):
    safe: bool


class EnforceResponse(BaseModel):
    intent: IntentResult
    decision: Literal["block", "allow", "clarify"]
    response: str
    validation: ValidationResult
