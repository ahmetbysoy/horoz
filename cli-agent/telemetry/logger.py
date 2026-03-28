class AgentLogger:
    def log_model_call(self, provider: str, success: bool) -> None:
        print(f"[MODEL] {provider} success={success}")

    def log_tool_call(self, tool_name: str, success: bool) -> None:
        print(f"[TOOL] {tool_name} success={success}")
