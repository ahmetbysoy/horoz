from pathlib import Path


def file_read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")
