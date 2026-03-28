from agent.core import Agent


def test_agent_stops_when_budget_exceeded(capsys):
    agent = Agent(model="mock", verbose=False, safe_mode=False)
    agent.session_token_budget = 0
    agent.run("hello")
    captured = capsys.readouterr()
    assert "budget exceeded" in captured.out.lower()
