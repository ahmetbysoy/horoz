from agent.loop import run_agent_loop
from agent.state import AgentState


class DummyMemory:
    def __init__(self):
        self.items = []

    def get_context(self):
        return ""

    def add(self, role, content):
        self.items.append((role, content))


class DummyRouter:
    def __init__(self):
        self.calls = 0

    def detect_task_type(self, user_input):
        return "chat"

    def call(self, prompt, task_type="chat"):
        self.calls += 1
        return '{"tool":"run_shell","args":{"command":"pwd"}}'


class DummyPermission:
    def check(self, tool_call):
        return True


class DummyTools:
    def execute(self, tool_call):
        return "ok"


def test_loop_tool_cooldown_triggers():
    state = AgentState(max_steps=10)
    out = run_agent_loop(
        user_input="test",
        state=state,
        memory=DummyMemory(),
        tools_text="",
        router=DummyRouter(),
        permission=DummyPermission(),
        tool_executor=DummyTools(),
    )
    assert "cooldown" in out.lower()
