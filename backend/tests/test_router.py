from intent_layer.router import route_decision


def test_block_returns_canned_message_without_calling_api():
    called = []
    out = route_decision("block", "hi", lambda p: called.append(p) or "x")
    assert "cannot help" in out.lower()
    assert called == []


def test_clarify_returns_canned_message_without_calling_api():
    called = []
    out = route_decision("clarify", "hi", lambda p: called.append(p) or "x")
    assert "clarify" in out.lower()
    assert called == []


def test_allow_calls_api_and_returns_result():
    out = route_decision("allow", "ping", lambda p: f"echo:{p}")
    assert out == "echo:ping"


def test_allow_with_failing_api_returns_fallback():
    def boom(_):
        raise RuntimeError("down")

    out = route_decision("allow", "ping", boom)
    assert "unavailable" in out.lower()
