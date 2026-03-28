from pathlib import Path


class ToolSecurity:
    def __init__(self, allowed_dirs: list[str] | None = None) -> None:
        self.allowed_dirs = [Path(p).resolve() for p in (allowed_dirs or ["."])]
        self.blocked_patterns = ["rm -rf /", "> /dev/", "chmod 777", "curl | bash", "wget | sh"]

    def check_command(self, command: str) -> tuple[bool, str]:
        for pattern in self.blocked_patterns:
            if pattern in command:
                return False, f"blocked pattern: {pattern}"
        return True, "ok"

    def check_path(self, path: str) -> tuple[bool, str]:
        resolved = Path(path).expanduser().resolve()
        if not any(str(resolved).startswith(str(root)) for root in self.allowed_dirs):
            return False, "path outside allowed directories"
        return True, "ok"
