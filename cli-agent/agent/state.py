from dataclasses import dataclass, field, asdict


@dataclass
class AgentState:
    step: int = 0
    max_steps: int = 15
    goal: str = ""
    last_action: str | None = None
    last_observation: str | None = None
    errors: list[str] = field(default_factory=list)
    consecutive_errors: int = 0
    max_consecutive_errors: int = 3
    status: str = "running"

    def should_stop(self) -> bool:
        return (
            self.step >= self.max_steps
            or self.consecutive_errors >= self.max_consecutive_errors
            or self.status in {"completed", "error", "stopped"}
        )

    def serialize(self) -> dict:
        return asdict(self)
