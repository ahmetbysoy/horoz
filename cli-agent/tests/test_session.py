from session.manager import SessionManager


def test_save_and_load_session(tmp_path):
    sm = SessionManager(session_dir=str(tmp_path))
    sid = sm.new_session_id()
    sm.save(sid, {"hello": "world"})
    loaded = sm.load(sid)
    assert loaded["hello"] == "world"
