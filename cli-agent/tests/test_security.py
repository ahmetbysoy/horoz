from pathlib import Path

from tools.security import ToolSecurity


def test_blocked_command():
    sec = ToolSecurity()
    allowed, _ = sec.check_command("rm -rf /")
    assert not allowed


def test_block_sensitive_path():
    sec = ToolSecurity(allowed_dirs=["."], sensitive_paths=["~/.ssh"])
    allowed, _ = sec.check_path(str(Path("~/.ssh/id_rsa").expanduser()))
    assert not allowed
