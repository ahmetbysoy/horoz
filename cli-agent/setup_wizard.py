from pathlib import Path


def check_setup() -> bool:
    return Path(".env").exists()


def run_setup_wizard() -> None:
    env_example = Path(".env.example")
    env_path = Path(".env")
    if env_example.exists() and not env_path.exists():
        env_path.write_text(env_example.read_text(encoding="utf-8"), encoding="utf-8")
        print("[Setup] .env oluşturuldu. API key değerlerini doldurun.")
    else:
        print("[Setup] .env bulunamadı. Lütfen .env.example dosyasını kopyalayın.")
