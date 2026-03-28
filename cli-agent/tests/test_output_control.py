from agent.output_control import control_output


def test_control_output_removes_duplicate_lines():
    text = "a\na\nb"
    out = control_output(text, max_words=20)
    assert out.splitlines() == ["a", "b"]


def test_control_output_clamps_words():
    text = " ".join(["x"] * 10)
    out = control_output(text, max_words=3)
    assert out.endswith("[TRUNCATED]")
