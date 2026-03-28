from datetime import datetime


class AgentLogger:
    def __init__(self, verbose: bool = False) -> None:
        self.verbose = verbose

    def _emit(self, kind: str, payload: str) -> None:
        if self.verbose:
            stamp = datetime.utcnow().isoformat(timespec="seconds")
            print(f"[{stamp}] [{kind}] {payload}")

    def log_model_call(self, provider: str, success: bool) -> None:
        self._emit("MODEL", f"provider={provider} success={success}")

    def log_tool_call(self, tool_name: str, success: bool) -> None:
        self._emit("TOOL", f"tool={tool_name} success={success}")
