from intent_layer.policy import evaluate_policy


def test_blocked_label():
    assert evaluate_policy("financial_advice", allowed=["general_coding"], blocked=["financial_advice"]) == "block"


def test_allowed_label():
    assert evaluate_policy("general_coding", allowed=["general_coding"], blocked=[]) == "allow"


def test_unknown_label_clarifies():
    assert evaluate_policy("unclear", allowed=["general_coding"], blocked=[]) == "clarify"


def test_blocked_takes_precedence_over_allowed():
    assert evaluate_policy("x", allowed=["x"], blocked=["x"]) == "block"


def test_empty_lists_default_clarify():
    assert evaluate_policy("anything") == "clarify"


def test_rules_intent_match():
    rules = [{"when": {"intent": "payments_api_help"}, "then": "allow"}, {"default": "block"}]
    assert evaluate_policy("payments_api_help", rules=rules) == "allow"
    assert evaluate_policy("financial_advice", rules=rules) == "block"


def test_rules_intent_in():
    rules = [{"when": {"intent_in": ["a", "b"]}, "then": "allow"}, {"default": "clarify"}]
    assert evaluate_policy("a", rules=rules) == "allow"
    assert evaluate_policy("c", rules=rules) == "clarify"


def test_rules_intent_not_in():
    rules = [{"when": {"intent_not_in": ["bad"]}, "then": "allow"}, {"default": "block"}]
    assert evaluate_policy("good", rules=rules) == "allow"
    assert evaluate_policy("bad", rules=rules) == "block"


def test_rules_confidence_gte():
    rules = [{"when": {"intent": "x", "confidence_gte": 0.8}, "then": "allow"}, {"default": "clarify"}]
    assert evaluate_policy("x", rules=rules, confidence=0.9) == "allow"
    assert evaluate_policy("x", rules=rules, confidence=0.5) == "clarify"


def test_rules_confidence_lt():
    rules = [{"when": {"confidence_lt": 0.3}, "then": "block"}, {"default": "allow"}]
    assert evaluate_policy("x", rules=rules, confidence=0.1) == "block"
    assert evaluate_policy("x", rules=rules, confidence=0.5) == "allow"


def test_rules_fallthrough_defaults_allow():
    rules = [{"when": {"intent": "never"}, "then": "block"}]
    assert evaluate_policy("other", rules=rules) == "allow"


def test_rules_take_precedence_over_lists():
    rules = [{"default": "allow"}]
    assert evaluate_policy("blocked_label", allowed=[], blocked=["blocked_label"], rules=rules) == "allow"
