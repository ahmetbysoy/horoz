from pathlib import Path

from tools.security import ToolSecurity

security = ToolSecurity()


def file_write(path: str, content: str) -> str:
    allowed, reason = security.check_path(path)
    if not allowed:
        return f"[SECURITY] {reason}"
    Path(path).write_text(content, encoding="utf-8")
    return f"written: {path}"
