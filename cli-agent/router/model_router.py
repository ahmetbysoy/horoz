from providers.cloudflare import CloudflareWorkersAIProvider
from providers.cohere import CohereProvider
from providers.deepseek import DeepSeekProvider
from providers.gemini import GeminiProvider
from providers.groq import GroqProvider
from providers.huggingface import HuggingFaceProvider
from providers.ollama import OllamaProvider
from providers.openrouter import OpenRouterProvider
from providers.together import TogetherProvider


class SmartRouter:
    def __init__(self, force_model: str | None = None) -> None:
        self.force_model = force_model
        self.providers = {
            "groq": GroqProvider(),
            "gemini": GeminiProvider(),
            "deepseek": DeepSeekProvider(),
            "together": TogetherProvider(),
            "openrouter": OpenRouterProvider(),
            "huggingface": HuggingFaceProvider(),
            "cohere": CohereProvider(),
            "cloudflare": CloudflareWorkersAIProvider(),
            "ollama": OllamaProvider(),
        }
        self.default_order = [
            "groq",
            "gemini",
            "deepseek",
            "together",
            "openrouter",
            "huggingface",
            "cohere",
            "cloudflare",
            "ollama",
        ]

    def call(self, prompt: str, task_type: str = "chat") -> str:
        if self.force_model:
            return f"[MOCK:{self.force_model}] {prompt[:200]}"

        route = self._route(task_type)
        for provider_name in route:
            provider = self.providers[provider_name]
            if not provider.is_available():
                continue
            try:
                return provider.chat([{"role": "user", "content": prompt}])
            except Exception:
                continue

        return "Tüm provider çağrıları başarısız oldu."

    def _route(self, task_type: str) -> list[str]:
        mapping = {
            "code": ["deepseek", "groq", "gemini", "openrouter", "ollama"],
            "fast": ["groq", "cloudflare", "gemini", "together", "ollama"],
            "long_context": ["gemini", "together", "openrouter", "ollama"],
            "embedding": ["cohere", "huggingface", "ollama"],
        }
        prioritized = mapping.get(task_type, [])
        remaining = [p for p in self.default_order if p not in prioritized]
        return prioritized + remaining

    def detect_task_type(self, user_input: str) -> str:
        text = user_input.lower()
        if any(token in text for token in ["kod", "code", "refactor", "debug"]):
            return "code"
        if any(token in text for token in ["hızlı", "quick", "fast"]):
            return "fast"
        if any(token in text for token in ["uzun", "long context", "summarize all"]):
            return "long_context"
        if any(token in text for token in ["embedding", "vektör", "rag"]):
            return "embedding"
        return "chat"
