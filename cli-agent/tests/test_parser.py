from agent.response_parser import parse_response


def test_parse_plain_text():
    parsed = parse_response("hello")
    assert parsed.type == "text"
