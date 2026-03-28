class TokenTracker:
    def __init__(self) -> None:
        self.input_tokens = 0
        self.output_tokens = 0
        self.calls = 0

    def add(self, in_tokens: int, out_tokens: int) -> None:
        self.input_tokens += max(in_tokens, 0)
        self.output_tokens += max(out_tokens, 0)
        self.calls += 1

    def snapshot(self) -> dict:
        return {
            "calls": self.calls,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.input_tokens + self.output_tokens,
        }
