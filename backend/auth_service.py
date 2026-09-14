"""Small persistent auth store for the local Focus development server."""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

DB_PATH = Path(os.environ.get("FOCUS_DB_PATH", Path(__file__).with_name("focus.db")))
SESSION_TTL = timedelta(days=7)


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'learner', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
    connection.execute("CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
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
        admin_emails = {item.strip().lower() for item in os.environ.get("FOCUS_ADMIN_EMAILS", "").split(",") if item.strip()}
        role = "admin" if email.strip().lower() in admin_emails else "learner"
        cursor = connection.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", (name.strip(), email.strip().lower(), _password_hash(password), role))
        connection.commit()
        user_id = cursor.lastrowid
    stored = connection.execute("SELECT id, name, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.now(timezone.utc) + SESSION_TTL).isoformat()
    connection.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user_id, expires_at))
    connection.commit()
    connection.close()
    return token, dict(stored)


def current_user(token: str | None) -> dict | None:
    if not token:
        return None
    connection = _connect()
    now = datetime.now(timezone.utc).isoformat()
    connection.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
    user = connection.execute("SELECT users.id, users.name, users.email, users.role FROM users JOIN sessions ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > ?", (token, now)).fetchone()
    connection.commit()
    connection.close()
    return dict(user) if user else None


def end_session(token: str | None) -> None:
    if token:
        connection = _connect()
        connection.execute("DELETE FROM sessions WHERE token = ?", (token,))
        connection.commit()
        connection.close()
