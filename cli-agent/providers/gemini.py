import os

from providers.base import BaseProvider


class GeminiProvider(BaseProvider):
    name = "gemini"

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[Gemini TODO] " + messages[-1]["content"][:200]
