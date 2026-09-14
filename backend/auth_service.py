"""Small persistent auth store for the local Focus development server."""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from pathlib import Path

DB_PATH = Path(os.environ.get("FOCUS_DB_PATH", Path(__file__).with_name("focus.db")))
ADMIN_NAME = "ejeme godwin"
SESSIONS: dict[str, int] = {}


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'learner', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
    connection.commit()
    return connection


def _password_hash(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"{salt.hex()}${digest.hex()}"


def _password_matches(password: str, stored: str) -> bool:
    try:
        salt_hex, digest = stored.split("$", 1)
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 120_000).hex()
        return hmac.compare_digest(candidate, digest)
    except (ValueError, TypeError):
        return False


def start_session(name: str, email: str, password: str, create_account: bool = False) -> tuple[str, dict]:
    if len(password) < 8 or not email:
        raise ValueError("Email and a password of at least 8 characters are required.")
    connection = _connect()
    user = connection.execute("SELECT * FROM users WHERE lower(email) = lower(?)", (email,)).fetchone()
    if user:
        if create_account:
            connection.close()
            raise ValueError("An account with this email already exists. Sign in instead.")
        if not _password_matches(password, user["password_hash"]):
            connection.close()
            raise PermissionError("Incorrect password.")
        user_id = user["id"]
    else:
        if not create_account or not name:
            connection.close()
            raise ValueError("No account was found for this email. Create an account first.")
        admin_exists = connection.execute("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").fetchone()
        role = "admin" if name.strip().lower() == ADMIN_NAME and not admin_exists else "learner"
        cursor = connection.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", (name.strip(), email.strip().lower(), _password_hash(password), role))
        connection.commit()
        user_id = cursor.lastrowid
    stored = connection.execute("SELECT id, name, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    connection.close()
    token = secrets.token_urlsafe(32)
    SESSIONS[token] = user_id
    return token, dict(stored)


def current_user(token: str | None) -> dict | None:
    if not token or token not in SESSIONS:
        return None
    connection = _connect()
    user = connection.execute("SELECT id, name, email, role FROM users WHERE id = ?", (SESSIONS[token],)).fetchone()
    connection.close()
    return dict(user) if user else None


def end_session(token: str | None) -> None:
    if token:
        SESSIONS.pop(token, None)
