import os

from providers.base import BaseProvider


class OpenRouterProvider(BaseProvider):
    name = "openrouter"

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENROUTER_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[OpenRouter TODO] " + messages[-1]["content"][:200]
