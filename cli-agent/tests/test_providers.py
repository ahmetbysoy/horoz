from urllib.error import URLError

from providers.ollama import OllamaProvider
from providers.openrouter import OpenRouterProvider


def test_openrouter_unavailable_without_key(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    provider = OpenRouterProvider()
    assert not provider.is_available()


def test_ollama_is_available_false_on_url_error(monkeypatch):
    provider = OllamaProvider()

    def boom(*args, **kwargs):
        raise URLError("down")

    monkeypatch.setattr("providers.ollama.urlopen", boom)
    assert not provider.is_available()
