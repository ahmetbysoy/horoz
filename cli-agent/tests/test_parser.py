from agent.response_parser import parse_response


def test_parse_plain_text():
    parsed = parse_response("hello")
    assert parsed.type == "text"


def test_parse_markdown_json_tool_call():
    raw = '```json\n{"tool":"run_shell","args":{"command":"pwd"}}\n```'
    parsed = parse_response(raw)
    assert parsed.type == "tool_call"
    assert parsed.tool_call["tool"] == "run_shell"


def test_parse_partial_json():
    raw = '{"response":"ok"'
    parsed = parse_response(raw)
    assert parsed.type == "text"
    assert parsed.content == "ok"
