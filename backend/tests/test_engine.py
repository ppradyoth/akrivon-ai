import pytest

from app.engine import (
    _extract_json_array,
    _extract_json_object,
    _risk_score,
    constraint_builder,
    strategy_engine,
)
from app.models import Analysis, ScanConfig, StrategyName, ViolationRecord


def _violation(severity="high", confidence=1.0):
    return ViolationRecord(
        strategy=StrategyName.role_transformation,
        prompt="p",
        response="r",
        analysis=Analysis(
            violation=True,
            type="capability_drift",
            severity=severity,
            reason="because",
            confidence=confidence,
        ),
    )


def test_risk_score_zero_when_no_tests():
    assert _risk_score([_violation()], 0) == 0.0


def test_risk_score_no_violations():
    assert _risk_score([], 10) == 0.0


def test_risk_score_single_critical_full_confidence():
    assert _risk_score([_violation("critical", 1.0)], 1) == 100.0


def test_risk_score_severity_weighting():
    assert _risk_score([_violation("low", 1.0)], 1) == 25.0
    assert _risk_score([_violation("medium", 1.0)], 1) == 50.0
    assert _risk_score([_violation("high", 1.0)], 1) == 80.0


def test_risk_score_confidence_scaling():
    assert _risk_score([_violation("critical", 0.5)], 1) == 50.0


def test_risk_score_capped_at_100():
    score = _risk_score([_violation("critical", 1.0) for _ in range(5)], 1)
    assert score == 100.0


def test_risk_score_averaged_over_total_tests():
    assert _risk_score([_violation("critical", 1.0)], 4) == 25.0


def test_extract_json_object():
    assert _extract_json_object('prefix {"a": 1, "b": [2,3]} suffix') == {"a": 1, "b": [2, 3]}


def test_extract_json_object_missing_raises():
    with pytest.raises(ValueError):
        _extract_json_object("no json here")


def test_extract_json_array():
    assert _extract_json_array('blah ["x", "y"] blah') == ["x", "y"]


def test_extract_json_array_missing_raises():
    with pytest.raises(ValueError):
        _extract_json_array("no array")


def test_strategy_engine_round_robin():
    out = strategy_engine(3)
    assert out == [
        StrategyName.role_transformation,
        StrategyName.gradual_drift,
        StrategyName.language_variation,
    ]


def test_strategy_engine_wraps_around():
    out = strategy_engine(10)
    assert len(out) == 10
    assert out[8] == StrategyName.role_transformation


def test_strategy_engine_empty():
    assert strategy_engine(0) == []


def test_constraint_builder_trims_and_defaults_language():
    config = ScanConfig(
        api_url="https://example.com",
        use_case="A valid use case description",
        allowed_capabilities=["  code  ", ""],
        disallowed_capabilities=[" finance "],
        languages=["  ", ""],
        num_tests=3,
    )
    constraints = constraint_builder(config)
    assert constraints.allowed_capabilities == ["code"]
    assert constraints.disallowed_capabilities == ["finance"]
    assert constraints.languages == ["English"]


def test_constraint_builder_keeps_supplied_languages():
    config = ScanConfig(
        api_url="https://example.com",
        use_case="A valid use case description",
        languages=["English", " Spanish "],
        num_tests=1,
    )
    constraints = constraint_builder(config)
    assert constraints.languages == ["English", "Spanish"]
