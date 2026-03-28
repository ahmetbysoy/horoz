import subprocess

from tools.security import ToolSecurity

security = ToolSecurity()


def run_shell(command: str, timeout: int = 15) -> str:
    allowed, reason = security.check_command(command)
    if not allowed:
        return f"[SECURITY] {reason}"

    completed = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=timeout)
    output = (completed.stdout or "") + (completed.stderr or "")
    return output[:50000]
