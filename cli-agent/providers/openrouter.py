import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen

from providers.base import BaseProvider, ProviderError


class OpenRouterProvider(BaseProvider):
    name = "openrouter"

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def chat(self, messages: list[dict[str, str]]) -> str:
        if not self.api_key:
            raise ProviderError("OPENROUTER_API_KEY missing")

        payload = json.dumps({"model": self.model, "messages": messages, "stream": False}).encode("utf-8")
        req = Request(
            f"{self.base_url}/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except URLError as exc:
            raise ProviderError(f"OpenRouter request failed: {exc}") from exc

        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ProviderError(f"OpenRouter response parse failed: {exc}") from exc


    def chat_stream(self, messages: list[dict[str, str]]):
        content = self.chat(messages)
        yield content
