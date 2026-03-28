def summarize_text(existing_summary: str, new_context: str) -> str:
    if not existing_summary:
        return new_context[:1000]
    return (existing_summary + "\n" + new_context)[:1000]
