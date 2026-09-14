import http.client
import json
import os
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

import auth_service
import server
from http.server import ThreadingHTTPServer


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        auth_service.DB_PATH = Path(self.temp_dir.name) / "focus.db"
        os.environ["FOCUS_ADMIN_EMAILS"] = "admin@example.com"
        with server.REQUESTS_LOCK:
            server.REQUESTS.clear()
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.FocusHandler)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join(timeout=2)
        os.environ.pop("FOCUS_ADMIN_EMAILS", None)
        self.temp_dir.cleanup()

    def request(self, method, path, payload=None, cookie=None):
        connection = http.client.HTTPConnection(*self.httpd.server_address)
        body = json.dumps(payload).encode() if payload is not None else None
        headers = {"Content-Type": "application/json"} if body is not None else {}
        if cookie:
            headers["Cookie"] = cookie
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        data = response.read()
        headers = dict(response.getheaders())
        connection.close()
        return response.status, headers, data

    def test_auth_sets_cookie_and_me_reads_persisted_session(self):
        status, headers, body = self.request("POST", "/api/auth/session", {"name": "Admin", "email": "admin@example.com", "password": "password123", "create_account": True})
        self.assertEqual(status, 200)
        self.assertIn("focus_session=", headers["Set-Cookie"])
        cookie = headers["Set-Cookie"].split(";", 1)[0]
        status, _, body = self.request("GET", "/api/auth/me", cookie=cookie)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["user"]["role"], "admin")

    def test_oversized_request_is_rejected_before_json_read(self):
        status, _, _ = self.request("POST", "/api/trace", {"code": "x" * (server.MAX_BODY_BYTES + 10)})
        self.assertEqual(status, 413)

    def test_static_path_traversal_is_rejected(self):
        outside = Path(self.temp_dir.name) / "secret.txt"
        outside.write_text("private")
        with patch.object(server, "DIST_DIR", Path(self.temp_dir.name) / "dist"):
            Path(server.DIST_DIR).mkdir()
            (Path(server.DIST_DIR) / "index.html").write_text("app")
            status, _, body = self.request("GET", "/../secret.txt")
        self.assertEqual(status, 404)
        self.assertNotIn(b"private", body)

    def test_trace_rate_limit_returns_429(self):
        with patch.dict(server.RATE_LIMITS, {"/api/trace": (1, 60)}):
            payload = {"code": "x = 1"}
            self.assertEqual(self.request("POST", "/api/trace", payload)[0], 200)
            self.assertEqual(self.request("POST", "/api/trace", payload)[0], 429)


if __name__ == "__main__":
    unittest.main()
