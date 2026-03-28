from tools.security import ToolSecurity


def test_blocked_command():
    sec = ToolSecurity()
    allowed, _ = sec.check_command("rm -rf /")
    assert not allowed
