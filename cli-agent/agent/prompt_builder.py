SYSTEM_PROMPT = "You are a safe, helpful CLI AI agent."


def build_prompt(user_input: str, memory: str, tools: str, state: dict) -> str:
    sections = [SYSTEM_PROMPT]
    if tools:
        sections.append(f"## Available Tools\n{tools}")
    if memory:
        sections.append(f"## Context\n{memory}")
    sections.append(f"## Current State\n{state}")
    sections.append(f"## User Request\n{user_input}")
    return "\n\n".join(sections)
