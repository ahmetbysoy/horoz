class BaseProvider:
    name = "base"

    def chat(self, messages: list[dict[str, str]]) -> str:
        raise NotImplementedError

    def is_available(self) -> bool:
        return True
