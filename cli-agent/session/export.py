def export_markdown(messages: list[dict[str, str]]) -> str:
    lines = ["# Session Export", ""]
    for msg in messages:
        lines.append(f"## {msg['role']}")
        lines.append(msg["content"])
        lines.append("")
    return "\n".join(lines)
