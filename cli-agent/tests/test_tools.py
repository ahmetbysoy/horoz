from tools.registry import ToolRegistry


def test_unknown_tool():
    reg = ToolRegistry()
    out = reg.execute({"tool": "missing", "args": {}})
    assert "Unknown tool" in out
