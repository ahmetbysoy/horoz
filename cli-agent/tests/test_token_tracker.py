from telemetry.token_tracker import TokenTracker


def test_token_tracker_exceeded():
    t = TokenTracker()
    t.add(5, 6)
    assert t.exceeded(10)
