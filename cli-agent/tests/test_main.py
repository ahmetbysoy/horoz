from agent.self_test import run_self_test


def test_run_self_test_returns_zero():
    assert run_self_test() == 0
