import os

from providers.base import BaseProvider


class GroqProvider(BaseProvider):
    name = "groq"

    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[Groq TODO] " + messages[-1]["content"][:200]
