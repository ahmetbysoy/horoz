from providers.gemini import GeminiProvider
from providers.groq import GroqProvider
from providers.openrouter import OpenRouterProvider
from providers.ollama import OllamaProvider


class SmartRouter:
    def __init__(self, force_model: str | None = None) -> None:
        self.force_model = force_model
        self.providers = [
            GroqProvider(),
            GeminiProvider(),
            OpenRouterProvider(),
            OllamaProvider(),
        ]

    def call(self, prompt: str, task_type: str = "chat") -> str:
        if self.force_model:
            return f"[MOCK:{self.force_model}] {prompt[:200]}"

        for provider in self.providers:
            if not provider.is_available():
                continue
            try:
                return provider.chat([{"role": "user", "content": prompt}])
            except Exception:
                continue

        return "Tüm provider çağrıları başarısız oldu."
