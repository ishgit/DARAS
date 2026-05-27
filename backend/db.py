"""Database helpers — connection lifecycle, versioned migrations, mobile hashing."""
import sqlite3, hashlib, hmac, os
from flask import g
from config import SECRET_KEY, DB_PATH, ADMIN_USER, ADMIN_PASS, PBKDF2_ITERATIONS


def _hash_mobile(mobile: str) -> str:
    """HMAC-SHA256 of mobile using SECRET_KEY as pepper — one-way, rainbow-table resistant."""
    return hmac.new(SECRET_KEY.encode(), mobile.encode(), "sha256").hexdigest()


def get_db():
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        g.db = conn
    return g.db


def close_db(exc):
    db = g.pop("db", None)
    if db:
        db.close()


# ─── Migrations ───────────────────────────────────────────────────────────────
# To add a schema change: define _mN(conn) below, then append (N, _mN) to
# _MIGRATIONS. Never edit or reorder existing entries.

def _m1(conn):
    """
    Initial schema — idempotent so it runs safely against both empty databases
    and legacy ones that predate the migration system. New databases get the
    full column set from CREATE TABLE; legacy ones get missing columns via
    ALTER TABLE (which is a no-op when the column already exists).
    """
    for ddl in [
        """CREATE TABLE IF NOT EXISTS users (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id       TEXT    UNIQUE NOT NULL,
            name             TEXT    NOT NULL,
            age              INTEGER,
            mobile           TEXT,
            mobile_hash      TEXT    DEFAULT NULL,
            mobile_last4     TEXT    DEFAULT NULL,
            vocation         TEXT    NOT NULL,
            vocation_custom  TEXT,
            city             TEXT,
            state            TEXT,
            language         TEXT    DEFAULT 'hi',
            household_size   INTEGER,
            employment_type  TEXT,
            has_bank_account INTEGER,
            ip_address       TEXT,
            user_agent       TEXT,
            deleted_at       TEXT    DEFAULT NULL,
            created_at       TEXT    DEFAULT (datetime('now')),
            last_active      TEXT    DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS loan_assessments (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id          INTEGER NOT NULL,
            loan_type        TEXT    NOT NULL,
            loan_amount      REAL    DEFAULT 0,
            loan_purpose     TEXT,
            loan_source      TEXT,
            interest_rate    REAL    DEFAULT 0,
            tenure_months    INTEGER DEFAULT 12,
            loan_remaining   REAL    DEFAULT 0,
            income           REAL    DEFAULT 0,
            rent             REAL    DEFAULT 0,
            grocery          REAL    DEFAULT 0,
            medicine         REAL    DEFAULT 0,
            education        REAL    DEFAULT 0,
            mobile_bill      REAL    DEFAULT 0,
            gaon             REAL    DEFAULT 0,
            other_expenses   REAL    DEFAULT 0,
            expenses_total   REAL    DEFAULT 0,
            monthly_savings  REAL    DEFAULT 0,
            emi              REAL    DEFAULT 0,
            total_interest   REAL    DEFAULT 0,
            monthly_interest REAL    DEFAULT 0,
            loan_to_income   REAL    DEFAULT 0,
            foir             REAL    DEFAULT 0,
            dscr             REAL    DEFAULT 0,
            max_safe_loan    REAL    DEFAULT 0,
            is_current       INTEGER DEFAULT 1,
            status           TEXT    NOT NULL,
            conclusion       TEXT,
            created_at       TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""",
        """CREATE TABLE IF NOT EXISTS app_events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER,
            event       TEXT    NOT NULL,
            meta        TEXT,
            created_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""",
        """CREATE TABLE IF NOT EXISTS open_questions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER,
            question    TEXT    NOT NULL,
            context     TEXT,
            resolved_by TEXT,
            created_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""",
        """CREATE TABLE IF NOT EXISTS admin_users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT    UNIQUE NOT NULL,
            password_hash TEXT    NOT NULL,
            salt          TEXT    DEFAULT NULL,
            full_name     TEXT,
            role          TEXT    DEFAULT 'analyst',
            last_login    TEXT,
            created_at    TEXT    DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS admin_sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id    INTEGER NOT NULL,
            token       TEXT    UNIQUE NOT NULL,
            expires_at  TEXT    NOT NULL,
            ip_address  TEXT,
            created_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY(admin_id) REFERENCES admin_users(id)
        )""",
    ]:
        conn.execute(ddl)
    conn.commit()

    # Backfill for legacy databases: add columns that may not exist yet.
    # New databases already have the full column set from CREATE TABLE above.
    def _ac(table, col, defn):
        try:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} {defn}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" not in str(e):
                raise

    _ac("users",            "mobile_hash",      "TEXT DEFAULT NULL")
    _ac("users",            "mobile_last4",     "TEXT DEFAULT NULL")
    _ac("users",            "deleted_at",       "TEXT DEFAULT NULL")
    _ac("users",            "household_size",   "INTEGER")
    _ac("users",            "employment_type",  "TEXT")
    _ac("users",            "has_bank_account", "INTEGER")
    _ac("loan_assessments", "foir",             "REAL DEFAULT 0")
    _ac("loan_assessments", "dscr",             "REAL DEFAULT 0")
    _ac("loan_assessments", "is_current",       "INTEGER DEFAULT 1")
    _ac("open_questions",   "resolved_by",      "TEXT")
    _ac("admin_users",      "salt",             "TEXT DEFAULT NULL")
    conn.commit()

    # Backfill plain mobile numbers to hashed form
    rows = conn.execute(
        "SELECT id, mobile FROM users WHERE mobile IS NOT NULL AND mobile != '' AND mobile_hash IS NULL"
    ).fetchall()
    for uid, mob in rows:
        conn.execute(
            "UPDATE users SET mobile_hash=?, mobile_last4=?, mobile=NULL WHERE id=?",
            (_hash_mobile(mob), mob[-4:], uid)
        )
    if rows:
        conn.commit()

    # Seed initial admin account
    if not conn.execute("SELECT id FROM admin_users LIMIT 1").fetchone():
        salt = os.urandom(32).hex()
        pw_hash = hashlib.pbkdf2_hmac(
            "sha256", ADMIN_PASS.encode(), bytes.fromhex(salt), PBKDF2_ITERATIONS
        ).hex()
        conn.execute(
            "INSERT INTO admin_users (username, password_hash, salt, full_name, role) VALUES (?,?,?,?,?)",
            (ADMIN_USER, pw_hash, salt, "DARAS Admin", "superadmin")
        )
        conn.commit()
        print(f"[DARAS] Admin seeded → {ADMIN_USER}")


# Add new migrations at the end only — never edit or reorder existing entries.
_MIGRATIONS = [
    (1, _m1),
]


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA journal_mode=WAL")

    conn.execute("""
        CREATE TABLE IF NOT EXISTS schema_version (
            version    INTEGER PRIMARY KEY,
            applied_at TEXT    DEFAULT (datetime('now'))
        )
    """)
    conn.commit()

    applied = {row[0] for row in conn.execute("SELECT version FROM schema_version").fetchall()}

    for version, fn in _MIGRATIONS:
        if version not in applied:
            fn(conn)
            conn.execute(
                "INSERT INTO schema_version (version, applied_at) VALUES (?, datetime('now'))",
                (version,)
            )
            conn.commit()
            print(f"[DARAS] Migration {version} applied")

    conn.close()
