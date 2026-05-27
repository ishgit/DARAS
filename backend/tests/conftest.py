"""Shared fixtures and constants for the DARAS test suite.

Both backend_test.py (API) and browser_test.py (Playwright) import from here.
The `server` fixture is autouse so every test file gets an isolated uvicorn
process with a throw-away database — no pre-running server required.
"""
import os
import subprocess
import tempfile
import time

import pytest
import requests

from tests.test_config import _HOST, _PORT, BASE_URL, API, ADMIN_USER, ADMIN_PASS

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@pytest.fixture(scope="session", autouse=True)
def server():
    """Spin up an isolated uvicorn process with a throw-away DB and known credentials."""
    uvicorn_bin = os.path.join(_BACKEND_DIR, "venv", "bin", "uvicorn")
    with tempfile.TemporaryDirectory() as tmpdir:
        env = {
            **os.environ,
            "DB_PATH":      os.path.join(tmpdir, "test.db"),
            "ADMIN_USER":   ADMIN_USER,
            "ADMIN_PASS":   ADMIN_PASS,
            "DARAS_SECRET": "test-only-secret-not-for-prod",
            "APP_ENV":      "dev",
        }
        proc = subprocess.Popen(
            [uvicorn_bin, "server:app", "--host", _HOST, "--port", str(_PORT)],
            cwd=_BACKEND_DIR, env=env,
        )
        for _ in range(30):
            try:
                requests.get(f"{BASE_URL}/api/", timeout=1)
                break
            except Exception:
                time.sleep(0.3)
        else:
            proc.kill()
            pytest.fail("Test server did not start within 9 seconds")
        yield
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    tok = r.json().get("token")
    assert tok
    return tok


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
