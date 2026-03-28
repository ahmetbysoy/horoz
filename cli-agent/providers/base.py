class ProviderError(Exception):
    pass


class BaseProvider:
    name = "base"

    def chat(self, messages: list[dict[str, str]]) -> str:
        raise NotImplementedError

    def is_available(self) -> bool:
        return True

    @staticmethod
    def last_user_message(messages: list[dict[str, str]]) -> str:
        if not messages:
            return ""
        return messages[-1].get("content", "")
