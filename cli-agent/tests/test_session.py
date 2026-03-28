from session.manager import SessionManager


def test_save_and_load_session(tmp_path):
    sm = SessionManager(session_dir=str(tmp_path))
    sid = sm.new_session_id()
    sm.save(sid, {"hello": "world"})
    loaded = sm.load(sid)
    assert loaded["hello"] == "world"


def test_latest_session_id(tmp_path):
    sm = SessionManager(session_dir=str(tmp_path))
    sid1 = sm.new_session_id()
    sm.save(sid1, {"a": 1})
    sid2 = sm.new_session_id()
    sm.save(sid2, {"b": 2})
    assert sm.latest_session_id() in {sid1, sid2}


def test_list_sessions_with_meta_shape(tmp_path):
    sm = SessionManager(session_dir=str(tmp_path))
    sid = sm.new_session_id()
    sm.save(sid, {"x": 1})
    item = sm.list_sessions_with_meta()[0]
    assert {"id", "path", "modified"}.issubset(item.keys())
