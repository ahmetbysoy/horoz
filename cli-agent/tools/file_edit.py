from pathlib import Path

from tools.security import ToolSecurity

security = ToolSecurity()


def file_edit(path: str, old_text: str, new_text: str) -> str:
    allowed, reason = security.check_path(path)
    if not allowed:
        return f"[SECURITY] {reason}"
    file = Path(path)
    content = file.read_text(encoding="utf-8")
    updated = content.replace(old_text, new_text)
    file.write_text(updated, encoding="utf-8")
    return f"edited: {path}"
