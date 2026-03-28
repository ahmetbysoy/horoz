from providers.base import BaseProvider


class OllamaProvider(BaseProvider):
    name = "ollama"

    def is_available(self) -> bool:
        return True

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[Ollama fallback] " + messages[-1]["content"][:200]
