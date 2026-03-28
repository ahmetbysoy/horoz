from session.export import export_markdown


def test_export_markdown_contains_roles():
    text = export_markdown([{"role": "user", "content": "hi"}, {"role": "assistant", "content": "hey"}])
    assert "## user" in text
    assert "## assistant" in text
