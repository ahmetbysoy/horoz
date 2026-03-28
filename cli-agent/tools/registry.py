from config.loader import load_settings
from tools.file_edit import file_edit
from tools.file_read import file_read
from tools.file_write import file_write
from tools.schema import Tool
from tools.security import ToolSecurity
from tools.shell import run_shell


class ToolRegistry:
    def __init__(self) -> None:
        settings = load_settings()
        security_cfg = settings.get("security", {})
        self.security = ToolSecurity(
            allowed_dirs=security_cfg.get("allowed_directories", ["."]),
            sensitive_paths=security_cfg.get("sensitive_paths", ["~/.ssh", "~/.aws", "/etc/shadow"]),
        )

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

        security_error = self._validate_security(tool_name, args)
        if security_error:
            return security_error

        try:
            return str(tool.function(**args))
        except Exception as exc:
            return f"Tool error: {exc}"

    def schemas_as_text(self) -> str:
        return "\n".join([str(t.schema()) for t in self._tools.values()])

    def _validate_security(self, tool_name: str, args: dict) -> str | None:
        if tool_name == "run_shell":
            allowed, reason = self.security.check_command(args.get("command", ""))
            if not allowed:
                return f"[SECURITY] {reason}"

        if tool_name in {"file_read", "file_write", "file_edit"}:
            allowed, reason = self.security.check_path(args.get("path", ""))
            if not allowed:
                return f"[SECURITY] {reason}"
        return None
