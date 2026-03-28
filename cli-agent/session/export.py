def export_markdown(messages: list[dict[str, str]]) -> str:
    return "\n".join([f"- **{m['role']}**: {m['content']}" for m in messages])
