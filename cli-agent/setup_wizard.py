from pathlib import Path


def check_setup() -> bool:
    env_path = Path(".env")
    return env_path.exists()


def run_setup_wizard() -> None:
    print("[Setup] .env bulunamadı. Lütfen .env.example dosyasını kopyalayıp API anahtarlarını girin.")
