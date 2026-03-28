from router.model_router import SmartRouter


def test_router_returns_text():
    router = SmartRouter(force_model="mock")
    out = router.call("hello")
    assert isinstance(out, str)


def test_detect_task_type_code():
    router = SmartRouter(force_model="mock")
    assert router.detect_task_type("bu kodu debug et") == "code"


def test_route_priority_for_fast():
    router = SmartRouter(force_model="mock")
    route = router._route("fast")
    assert route[0] == "groq"
