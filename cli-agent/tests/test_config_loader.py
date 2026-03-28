from config.loader import load_settings


def test_load_settings_has_providers():
    settings = load_settings()
    assert "providers" in settings
    assert "groq" in settings["providers"]
