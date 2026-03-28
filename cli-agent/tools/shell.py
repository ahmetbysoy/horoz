import shlex
import subprocess


def run_shell(command: str, timeout: int = 15) -> str:
    try:
        args = shlex.split(command)
        completed = subprocess.run(args, capture_output=True, text=True, timeout=timeout, shell=False)
    except ValueError as exc:
        return f"[ERROR] invalid command: {exc}"
    except subprocess.TimeoutExpired:
        return "[ERROR] command timed out"

    output = (completed.stdout or "") + (completed.stderr or "")
    return output[:50000]
