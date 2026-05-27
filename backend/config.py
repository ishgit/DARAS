import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY      = os.environ.get("DARAS_SECRET", "daras-dev-secret-change-in-prod")
DB_PATH         = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "daras.db"))
TOKEN_TTL          = 12       # hours
PBKDF2_ITERATIONS  = 200_000  # NIST SP 800-132 minimum for SHA-256
ADMIN_USER      = os.environ.get("ADMIN_USER", "daras_admin")
ADMIN_PASS      = os.environ.get("ADMIN_PASS", "Daras@2024")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
_IS_PROD        = os.environ.get("APP_ENV") == "production"

if _IS_PROD:
    _unsafe = []
    if SECRET_KEY == "daras-dev-secret-change-in-prod":
        _unsafe.append("DARAS_SECRET is still the dev default")
    if ADMIN_PASS == "Daras@2024":
        _unsafe.append("ADMIN_PASS is still the dev default")
    if ADMIN_USER == "daras_admin":
        _unsafe.append("ADMIN_USER is still the dev default")
    if ALLOWED_ORIGINS == ["*"]:
        _unsafe.append("ALLOWED_ORIGINS is a wildcard — set explicit origins")
    if _unsafe:
        raise RuntimeError("Unsafe production config:\n" + "\n".join(f"  - {m}" for m in _unsafe))


def _now():
    """Current time as naive UTC datetime — consistent with SQLite's datetime('now')."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
