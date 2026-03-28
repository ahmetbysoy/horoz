import os
import time


class KeyRotator:
    def __init__(self, provider_name: str, rpm_limit: int = 30) -> None:
        self.provider_name = provider_name.upper()
        self.rpm_limit = rpm_limit
        self.keys = self._load_keys()
        self.current_idx = 0
        self.last_used: dict[str, float] = {}

    def _load_keys(self) -> list[str]:
        keys = []
        i = 1
        while True:
            value = os.getenv(f"{self.provider_name}_API_KEY_{i}")
            if not value:
                break
            keys.append(value)
            i += 1
        default = os.getenv(f"{self.provider_name}_API_KEY")
        if default:
            keys.append(default)
        return keys

    def get_key(self) -> str | None:
        if not self.keys:
            return None

        now = time.time()
        interval = 60 / self.rpm_limit
        for _ in range(len(self.keys)):
            key = self.keys[self.current_idx]
            last = self.last_used.get(key, 0)
            self.current_idx = (self.current_idx + 1) % len(self.keys)
            if now - last >= interval:
                self.last_used[key] = now
                return key
        return self.keys[0]
