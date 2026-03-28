import shlex
import subprocess

from tools.security import ToolSecurity

security = ToolSecurity()


def run_shell(command: str, timeout: int = 15) -> str:
    allowed, reason = security.check_command(command)
    if not allowed:
        return f"[SECURITY] {reason}"

    try:
        args = shlex.split(command)
        completed = subprocess.run(args, capture_output=True, text=True, timeout=timeout, shell=False)
    except ValueError as exc:
        return f"[ERROR] invalid command: {exc}"
    except subprocess.TimeoutExpired:
        return "[ERROR] command timed out"

    output = (completed.stdout or "") + (completed.stderr or "")
    return output[:50000]
