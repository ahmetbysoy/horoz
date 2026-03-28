import os

from providers.base import BaseProvider


class HuggingFaceProvider(BaseProvider):
    name = "huggingface"

    def __init__(self) -> None:
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[HuggingFace TODO] " + messages[-1]["content"][:200]
