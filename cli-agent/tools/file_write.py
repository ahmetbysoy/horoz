from pathlib import Path


def file_write(path: str, content: str) -> str:
    Path(path).write_text(content, encoding="utf-8")
    return f"written: {path}"
