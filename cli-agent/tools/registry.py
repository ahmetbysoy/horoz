from tools.file_edit import file_edit
from tools.file_read import file_read
from tools.file_write import file_write
from tools.schema import Tool
from tools.shell import run_shell


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {
            "file_read": Tool("file_read", "Read a file", {"path": "string"}, file_read, True, "low"),
            "file_write": Tool("file_write", "Write a file", {"path": "string", "content": "string"}, file_write, True, "high"),
            "file_edit": Tool(
                "file_edit",
                "Edit file text",
                {"path": "string", "old_text": "string", "new_text": "string"},
                file_edit,
                True,
                "high",
            ),
            "run_shell": Tool("run_shell", "Run shell command", {"command": "string"}, run_shell, True, "high"),
        }

    def get(self, name: str) -> Tool | None:
        return self._tools.get(name)

    def execute(self, tool_call: dict) -> str:
        tool_name = tool_call.get("tool")
        args = tool_call.get("args", {})
        tool = self.get(tool_name)
        if not tool:
            return f"Unknown tool: {tool_name}"
        try:
            return str(tool.function(**args))
        except Exception as exc:
            return f"Tool error: {exc}"

    def schemas_as_text(self) -> str:
        return "\n".join([str(t.schema()) for t in self._tools.values()])
