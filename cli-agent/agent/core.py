from agent.loop import run_agent_loop
from agent.memory import MemoryManager
from agent.permission import PermissionManager
from agent.state import AgentState
from router.model_router import SmartRouter
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

    def run(self, user_input: str) -> None:
        self.memory.add("user", user_input)
        output = run_agent_loop(
            user_input=user_input,
            state=self.state,
            memory=self.memory,
            tools_text=self.tools.schemas_as_text(),
            router=self.router,
            permission=self.permission,
            tool_executor=self.tools,
        )
        self.memory.add("assistant", output)
        print(output)

    def save_session(self) -> None:
        print("[Session] save TODO")

    def load_session(self, session_id: str) -> None:
        print(f"[Session] load TODO: {session_id}")

    def show_history(self) -> None:
        for msg in self.memory.get_recent():
            print(f"{msg['role']}: {msg['content']}")
