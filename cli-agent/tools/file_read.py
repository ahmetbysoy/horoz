from pathlib import Path

from tools.security import ToolSecurity

security = ToolSecurity()


def file_read(path: str) -> str:
    allowed, reason = security.check_path(path)
    if not allowed:
        return f"[SECURITY] {reason}"
    return Path(path).read_text(encoding="utf-8")
