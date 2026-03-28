from pathlib import Path

DEFAULT_SETTINGS_PATH = Path(__file__).with_name("settings.yaml")

DEFAULT_SETTINGS = {
    "providers": {
        "groq": {"enabled": True, "priority": 1},
        "gemini": {"enabled": True, "priority": 2},
        "deepseek": {"enabled": True, "priority": 3},
        "together": {"enabled": True, "priority": 4},
        "openrouter": {"enabled": True, "priority": 5},
        "huggingface": {"enabled": True, "priority": 6},
        "cohere": {"enabled": True, "priority": 7},
        "cloudflare": {"enabled": False, "priority": 8},
        "ollama": {"enabled": True, "priority": 9},
    },
    "security": {
        "allowed_directories": ["."],
        "sensitive_paths": ["~/.ssh", "~/.aws", "/etc/shadow"],
    },
}


def load_settings(path: str | None = None) -> dict:
    target = Path(path) if path else DEFAULT_SETTINGS_PATH
    if not target.exists():
        return DEFAULT_SETTINGS

    try:
        import yaml  # optional dependency

        loaded = yaml.safe_load(target.read_text(encoding="utf-8")) or {}
        return _merge_defaults(loaded)
    except ModuleNotFoundError:
        return DEFAULT_SETTINGS


def _merge_defaults(loaded: dict) -> dict:
    merged = DEFAULT_SETTINGS.copy()
    for key, value in loaded.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            inner = merged[key].copy()
            inner.update(value)
            merged[key] = inner
        else:
            merged[key] = value
    return merged
