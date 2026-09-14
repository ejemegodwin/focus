# Security notes

Focus is currently a prototype and should not be treated as a production-safe
public code execution service without additional isolation.

## Code execution

User code runs in a short-lived child process with best-effort CPU, memory,
file-size, descriptor, process, and timeout limits. Before exposing it publicly,
run code inside dedicated containers or VMs with a non-root user, isolated or
disabled networking, a read-only filesystem, strict resource limits, and no
access to application secrets.

Go traces invoke the installed Go toolchain and use a shared build cache under
`FOCUS_GO_CACHE` (default `/tmp/focus-go-cache`). Keep that cache outside any
user-facing static directory and isolate the entire worker before public use.

## Authentication

Passwords are stored as PBKDF2-HMAC-SHA256 hashes with per-user salts. Sessions
are stored in SQLite with a seven-day expiry and delivered through HttpOnly
cookies. Use HTTPS in production.

Admin access is assigned only to emails listed in `FOCUS_ADMIN_EMAILS`, a
comma-separated environment variable. Do not use a name match to bootstrap
administrators in a public deployment.

## Request protection

The API rejects request bodies larger than 25,000 bytes and applies per-IP
rate limits to authentication and trace endpoints. These in-process limits are
appropriate for one service instance; use a shared gateway or rate-limit store
when scaling horizontally.

## Data and deployment

SQLite requires persistent storage. The included Render deployment mounts a
persistent disk for the database, but a managed database is recommended before
running multiple instances. Client-side learning progress and analytics are
currently stored in browser storage and should not be treated as authoritative.

Account recovery, email verification, MFA, audit logging, and secret rotation
are not implemented yet.
