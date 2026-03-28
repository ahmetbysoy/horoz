import os

from providers.base import BaseProvider


class CohereProvider(BaseProvider):
    name = "cohere"

    def __init__(self) -> None:
        self.api_key = os.getenv("COHERE_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[Cohere TODO] " + messages[-1]["content"][:200]
