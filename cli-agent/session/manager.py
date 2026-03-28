import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4


class SessionManager:
    def __init__(self, session_dir: str = "~/.cli-agent/sessions") -> None:
        self.session_dir = Path(session_dir).expanduser()
        self.session_dir.mkdir(parents=True, exist_ok=True)

    def new_session_id(self) -> str:
        stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        return f"session-{stamp}-{uuid4().hex[:8]}"

    def save(self, session_id: str, data: dict) -> Path:
        path = self.session_dir / f"{session_id}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return path

    def load(self, session_id: str) -> dict:
        path = self.session_dir / f"{session_id}.json"
        return json.loads(path.read_text(encoding="utf-8"))

    def list_sessions(self) -> list[str]:
        return sorted([p.stem for p in self.session_dir.glob("*.json")], reverse=True)
