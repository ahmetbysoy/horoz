from agent.memory import MemoryManager


def test_memory_add_and_read():
    mem = MemoryManager(keep_recent_messages=2)
    mem.add("user", "a")
    assert "a" in mem.get_context()
