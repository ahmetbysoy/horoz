import os

from providers.base import BaseProvider


class CloudflareWorkersAIProvider(BaseProvider):
    name = "cloudflare"

    def __init__(self) -> None:
        self.account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        self.api_token = os.getenv("CLOUDFLARE_API_TOKEN")

    def is_available(self) -> bool:
        return bool(self.account_id and self.api_token)

    def chat(self, messages: list[dict[str, str]]) -> str:
        return "[Cloudflare TODO] " + messages[-1]["content"][:200]
