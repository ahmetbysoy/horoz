import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen

from providers.base import BaseProvider, ProviderError


class OllamaProvider(BaseProvider):
    name = "ollama"

    def __init__(self) -> None:
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3")

    def is_available(self) -> bool:
        req = Request(f"{self.base_url}/api/tags", method="GET")
        try:
            with urlopen(req, timeout=2):
                return True
        except URLError:
            return False

    def chat(self, messages: list[dict[str, str]]) -> str:
        payload = json.dumps({"model": self.model, "messages": messages, "stream": False}).encode("utf-8")
        req = Request(
            f"{self.base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except URLError as exc:
            raise ProviderError(f"Ollama request failed: {exc}") from exc

        try:
            return data["message"]["content"]
        except (KeyError, TypeError) as exc:
            raise ProviderError(f"Ollama response parse failed: {exc}") from exc
