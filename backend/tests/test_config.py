"""Shared constants for the DARAS test suite.

Imported by both conftest.py (fixtures) and test modules directly.
Keeping constants here avoids importing from conftest.py as a regular module,
which fails when pytest is invoked from the backend/ root rather than tests/.
"""

_HOST      = "127.0.0.1"
_PORT      = 5099
BASE_URL   = f"http://{_HOST}:{_PORT}"
API        = f"{BASE_URL}/api"
ADMIN_USER = "test_admin"
ADMIN_PASS = "TestAdmin@99"
