from router.model_router import SmartRouter
from router.streaming import stream_text_chunks


def test_stream_text_chunks():
    chunks = list(stream_text_chunks("abcdef", chunk_size=2))
    assert chunks == ["ab", "cd", "ef"]


def test_router_stream_mock_mode():
    router = SmartRouter(force_model="mock")
    out = "".join(router.stream("hello", task_type="chat"))
    assert "[MOCK:mock]" in out
