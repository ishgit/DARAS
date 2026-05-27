"""Admin authentication helpers and decorator."""
import hashlib, hmac, uuid, os
from datetime import timedelta
from functools import wraps
from flask import request, jsonify, g
from config import SECRET_KEY, TOKEN_TTL, PBKDF2_ITERATIONS, _now
from db import get_db


def _new_salt() -> str:
    return os.urandom(32).hex()


def _hash_pw(pw: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), PBKDF2_ITERATIONS).hex()


def _verify_pw(pw: str, stored_hash: str, stored_salt: str | None) -> bool:
    if stored_salt:
        return hmac.compare_digest(_hash_pw(pw, stored_salt), stored_hash)
    # Legacy path: salt was SECRET_KEY — valid until re-hashed on next login
    legacy = hashlib.pbkdf2_hmac("sha256", pw.encode(), SECRET_KEY.encode(), PBKDF2_ITERATIONS).hex()
    return hmac.compare_digest(legacy, stored_hash)


def _new_token() -> str:
    return hmac.new(SECRET_KEY.encode(), uuid.uuid4().bytes, "sha256").hexdigest()


def _token_exp() -> str:
    return (_now() + timedelta(hours=TOKEN_TTL)).strftime("%Y-%m-%d %H:%M:%S")


def admin_required(f):
    @wraps(f)
    def deco(*a, **kw):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth[7:]
        row = get_db().execute("""
            SELECT s.admin_id, s.expires_at, a.username, a.role
            FROM admin_sessions s JOIN admin_users a ON a.id=s.admin_id
            WHERE s.token=?
        """, (token,)).fetchone()
        if not row:
            return jsonify({"error": "Invalid token"}), 401
        from datetime import datetime
        if datetime.strptime(row["expires_at"], "%Y-%m-%d %H:%M:%S") < _now():
            return jsonify({"error": "Token expired"}), 401
        g.admin = {"id": row["admin_id"], "username": row["username"], "role": row["role"]}
        return f(*a, **kw)
    return deco
