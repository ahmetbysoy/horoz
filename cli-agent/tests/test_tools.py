from pathlib import Path

from tools.registry import ToolRegistry


def test_unknown_tool():
    reg = ToolRegistry()
    out = reg.execute({"tool": "missing", "args": {}})
    assert "Unknown tool" in out


def test_file_read_security_block():
    reg = ToolRegistry()
    out = reg.execute({"tool": "file_read", "args": {"path": "/etc/shadow"}})
    assert "[SECURITY]" in out


def test_file_write_and_read_inside_repo(tmp_path):
    reg = ToolRegistry()
    local_dir = Path(".tmp_test")
    local_dir.mkdir(exist_ok=True)
    target = local_dir / "a.txt"
    out = reg.execute({"tool": "file_write", "args": {"path": str(target), "content": "hello"}})
    assert "written" in out
    read = reg.execute({"tool": "file_read", "args": {"path": str(target)}})
    assert read == "hello"
    target.unlink(missing_ok=True)
    local_dir.rmdir()
