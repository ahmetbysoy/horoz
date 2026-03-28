from agent.core import Agent


def run_self_test() -> int:
    agent = Agent(model="mock", verbose=False, safe_mode=False)
    agent.run("quick smoke test", stream=False)
    stats = agent.stats()
    print("[SELF-TEST] ok", stats)
    return 0
