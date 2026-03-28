from agent.loop import run_agent_loop
from agent.memory import MemoryManager
from agent.output_control import control_output
from agent.permission import PermissionManager
from agent.state import AgentState
from config.loader import load_settings
from router.model_router import SmartRouter
from session.export import export_markdown
from session.manager import SessionManager
from telemetry.logger import AgentLogger
from telemetry.token_tracker import TokenTracker
from tools.registry import ToolRegistry


class Agent:
    def __init__(self, model: str | None = None, verbose: bool = False, safe_mode: bool = True) -> None:
        self.model = model
        self.verbose = verbose
        self.state = AgentState()
        self.memory = MemoryManager()
        self.permission = PermissionManager(safe_mode=safe_mode)
        self.router = SmartRouter(force_model=model)
        self.tools = ToolRegistry()
        self.session_manager = SessionManager()
        self.logger = AgentLogger(verbose=verbose)
        self.tokens = TokenTracker()
        self.session_id = self.session_manager.new_session_id()
        settings = load_settings()
        self.max_output_words = settings.get("limits", {}).get("max_output_tokens", 2000)

    def run(self, user_input: str, stream: bool = False) -> None:
        self.memory.add("user", user_input)
        self.tokens.add(in_tokens=len(user_input.split()), out_tokens=0)

        if stream:
            output = self._run_stream(user_input)
        else:
            output = run_agent_loop(
                user_input=user_input,
                state=self.state,
                memory=self.memory,
                tools_text=self.tools.schemas_as_text(),
                router=self.router,
                permission=self.permission,
                tool_executor=self.tools,
            )

        output = control_output(output, max_words=self.max_output_words)
        self.memory.add("assistant", output)
        self.tokens.add(in_tokens=0, out_tokens=len(output.split()))
        self.logger.log_model_call(provider="router", success=True)
        if not stream:
            print(output)

    def _run_stream(self, user_input: str) -> str:
        task_type = self.router.detect_task_type(user_input)
        full = ""
        for chunk in self.router.stream(user_input, task_type=task_type):
            print(chunk, end="", flush=True)
            full += chunk
        print()
        self.state.status = "completed"
        return full

    def save_session(self) -> None:
        payload = {
            "session_id": self.session_id,
            "state": self.state.serialize(),
            "messages": self.memory.messages,
            "summary": self.memory.summary,
            "token_usage": self.tokens.snapshot(),
        }
        path = self.session_manager.save(self.session_id, payload)
        print(f"[Session] saved: {path}")

    def load_session(self, session_id: str) -> None:
        data = self.session_manager.load(session_id)
        self.session_id = session_id
        self.state.step = data.get("state", {}).get("step", 0)
        self.state.status = data.get("state", {}).get("status", "running")
        self.memory.messages = data.get("messages", [])
        self.memory.summary = data.get("summary", "")
        usage = data.get("token_usage", {})
        self.tokens.input_tokens = usage.get("input_tokens", 0)
        self.tokens.output_tokens = usage.get("output_tokens", 0)
        self.tokens.calls = usage.get("calls", 0)
        print(f"[Session] loaded: {session_id}")

    def export_current_session_markdown(self) -> str:
        return export_markdown(self.memory.messages)

    def show_history(self) -> None:
        for msg in self.memory.get_recent():
            print(f"{msg['role']}: {msg['content']}")
