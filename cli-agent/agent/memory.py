class MemoryManager:
    def __init__(self, keep_recent_messages: int = 10) -> None:
        self.keep_recent_messages = keep_recent_messages
        self.messages: list[dict[str, str]] = []
        self.summary: str = ""

    def add(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})

    def get_context(self) -> str:
        recent = self.messages[-self.keep_recent_messages :]
        lines = [f"{m['role']}: {m['content']}" for m in recent]
        if self.summary:
            lines.insert(0, f"summary: {self.summary}")
        return "\n".join(lines)

    def get_recent(self) -> list[dict[str, str]]:
        return self.messages[-self.keep_recent_messages :]
