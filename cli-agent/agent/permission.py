class PermissionManager:
    def __init__(self, safe_mode: bool = True) -> None:
        self.safe_mode = safe_mode

    def check(self, tool_call: dict) -> bool:
        if not self.safe_mode:
            return True
        tool = tool_call.get("tool", "unknown")
        answer = input(f"[Permission] Run tool '{tool}'? [y/N]: ").strip().lower()
        return answer in {"y", "yes"}
