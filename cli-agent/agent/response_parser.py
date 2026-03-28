import json
import re
from dataclasses import dataclass


@dataclass
class ParsedResponse:
    type: str
    content: str | None = None
    tool_call: dict | None = None


def parse_response(raw_text: str) -> ParsedResponse:
    for parser in (parse_clean_json, parse_markdown_json):
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


def classify_json(data: dict) -> ParsedResponse:
    if "tool" in data and "args" in data:
        return ParsedResponse(type="tool_call", tool_call=data)
    if "response" in data:
        return ParsedResponse(type="text", content=str(data["response"]))
    return ParsedResponse(type="text", content=json.dumps(data, ensure_ascii=False))
