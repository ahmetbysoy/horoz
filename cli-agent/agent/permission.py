class PermissionManager:
    def __init__(self, safe_mode: bool = True) -> None:
        self.safe_mode = safe_mode
        self.allow_all_session = False
        self.allowed_tools: set[str] = set()

    def check(self, tool_call: dict) -> bool:
        if not self.safe_mode or self.allow_all_session:
            return True

        tool = tool_call.get("tool", "unknown")
        if tool in self.allowed_tools:
            return True

        answer = input(
            f"[Permission] Run '{tool}'? [y]es / [n]o / [s]ession allow all / [a]lways allow this tool: "
        ).strip().lower()

        if answer in {"y", "yes"}:
            return True
        if answer in {"s", "session"}:
            self.allow_all_session = True
            return True
        if answer in {"a", "always"}:
            self.allowed_tools.add(tool)
            return True
        return False
