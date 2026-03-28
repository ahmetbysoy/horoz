from router.model_router import SmartRouter


def test_router_returns_text():
    router = SmartRouter(force_model="mock")
    out = router.call("hello")
    assert isinstance(out, str)
