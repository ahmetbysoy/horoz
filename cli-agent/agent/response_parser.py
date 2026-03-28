import json
import re
from dataclasses import dataclass


@dataclass
class ParsedResponse:
    type: str
    content: str | None = None
    tool_call: dict | None = None


def parse_response(raw_text: str) -> ParsedResponse:
    strategies = [parse_clean_json, parse_markdown_json, parse_partial_json, parse_mixed_content]
    for parser in strategies:
        parsed = parser(raw_text)
        if parsed:
            return parsed
    return ParsedResponse(type="text", content=raw_text)


def parse_clean_json(text: str) -> ParsedResponse | None:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None
    return classify_json(data)


def parse_markdown_json(text: str) -> ParsedResponse | None:
    matches = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, flags=re.DOTALL)
    for match in matches:
        try:
            data = json.loads(match)
        except json.JSONDecodeError:
            continue
        return classify_json(data)
    return None


def parse_partial_json(text: str) -> ParsedResponse | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1:
        return None
    candidate = text[start : end + 1] if end != -1 else text[start:] + "}"
    candidate = _repair_json(candidate)
    try:
        data = json.loads(candidate)
    except json.JSONDecodeError:
        return None
    return classify_json(data)


def parse_mixed_content(text: str) -> ParsedResponse | None:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
    return classify_json(data)


def classify_json(data: dict) -> ParsedResponse:
    if "tool" in data and "args" in data:
        return ParsedResponse(type="tool_call", tool_call=data)
    if "response" in data:
        return ParsedResponse(type="text", content=str(data["response"]))
    return ParsedResponse(type="text", content=json.dumps(data, ensure_ascii=False))


def _repair_json(text: str) -> str:
    open_braces = text.count("{")
    close_braces = text.count("}")
    if open_braces > close_braces:
        text += "}" * (open_braces - close_braces)
    return text
