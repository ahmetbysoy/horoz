def clamp_words(text: str, max_words: int = 400) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "\n[TRUNCATED]"


def remove_repeated_lines(text: str) -> str:
    seen: set[str] = set()
    lines = []
    for line in text.splitlines():
        key = line.strip()
        if key and key in seen:
            continue
        if key:
            seen.add(key)
        lines.append(line)
    return "\n".join(lines)


def control_output(text: str, max_words: int = 400) -> str:
    return clamp_words(remove_repeated_lines(text), max_words=max_words)
