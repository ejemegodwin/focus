"""Local development API for the Focus visualizer."""

from __future__ import annotations

import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from auth_service import current_user, end_session, start_session
from sandbox_runner import TraceExecutionError, run_trace

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / "dist"


class FocusHandler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict, cookie: str | None = None):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", os.environ.get("FOCUS_ALLOWED_ORIGIN", "http://localhost:5173"))
        self.send_header("Access-Control-Allow-Credentials", "true")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def _token(self):
        cookies = self.headers.get("Cookie", "").split(";")
        for cookie in cookies:
            key, _, value = cookie.strip().partition("=")
            if key == "focus_session":
                return value
        return None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", os.environ.get("FOCUS_ALLOWED_ORIGIN", "http://localhost:5173"))
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.end_headers()

    def _serve_frontend(self, path: str):
        requested = (DIST_DIR / path.lstrip("/")).resolve()
        try:
            requested.relative_to(DIST_DIR.resolve())
        except ValueError:
            self._send(404, {"error": "Not found"})
            return
        file_path = requested if requested.is_file() else DIST_DIR / "index.html"
        if not file_path.is_file():
            self._send(404, {"error": "Frontend build not found"})
            return
        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(file_path.name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/auth/me":
            user = current_user(self._token())
            self._send(200, {"user": user})
        elif path == "/ready":
            self._send(200, {"status": "ready", "service": "focus-trace-api"})
        elif self.path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
        elif DIST_DIR.exists():
            self._serve_frontend(path)
        else:
            self._send(200, {"service": "focus-trace-api", "endpoint": "POST /api/trace"}) if path == "/" else self._send(404, {"error": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/auth/session":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                request = json.loads(self.rfile.read(length))
                token, user = start_session(
                    request.get("name", ""),
                    request.get("email", ""),
                    request.get("password", ""),
                    bool(request.get("create_account", False)),
                )
                self._send(200, {"user": user}, f"focus_session={token}; HttpOnly; SameSite=Lax; Path=/")
            except PermissionError as error:
                self._send(401, {"error": str(error)})
            except (ValueError, json.JSONDecodeError) as error:
                self._send(400, {"error": str(error) or "Invalid JSON request."})
            return
        if path != "/api/trace":
            self._send(404, {"error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            request = json.loads(self.rfile.read(length))
            code = request.get("code", "")
            if not isinstance(code, str) or len(code) > 20_000:
                self._send(400, {"error": "Code must be a string under 20,000 characters."})
                return
            max_steps = request.get("max_steps", 500)
            if not isinstance(max_steps, int) or isinstance(max_steps, bool) or not 1 <= max_steps <= 2_000:
                self._send(400, {"error": "max_steps must be an integer between 1 and 2,000."})
                return
            self._send(200, run_trace(code, max_steps=max_steps))
        except TraceExecutionError as error:
            self._send(408, {"error": str(error)})
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid JSON request."})

    def do_DELETE(self):
        if urlparse(self.path).path != "/api/auth/session":
            self._send(404, {"error": "Not found"})
            return
        end_session(self._token())
        self._send(200, {"ok": True}, "focus_session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/")

    def log_message(self, format: str, *args):
        print(f"[focus-api] {format % args}")


if __name__ == "__main__":
    host = os.environ.get("HOST", "localhost")
    port = int(os.environ.get("PORT", "8000"))
    print(f"Focus service listening on http://{host}:{port}")
    ThreadingHTTPServer((host, port), FocusHandler).serve_forever()
