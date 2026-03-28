class TokenTracker:
    def __init__(self) -> None:
        self.input_tokens = 0
        self.output_tokens = 0

    def add(self, in_tokens: int, out_tokens: int) -> None:
        self.input_tokens += in_tokens
        self.output_tokens += out_tokens
