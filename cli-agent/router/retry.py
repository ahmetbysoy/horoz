import time


def retry_with_backoff(func, max_attempts: int = 3, base_backoff_sec: float = 0.5):
    last_error = None
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as exc:
            last_error = exc
            if attempt < max_attempts - 1:
                time.sleep(base_backoff_sec * (2**attempt))
    raise RuntimeError(f"All retry attempts failed: {last_error}")
