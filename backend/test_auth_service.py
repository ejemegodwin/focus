import tempfile
import unittest
from pathlib import Path

import auth_service


class AuthServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        auth_service.DB_PATH = Path(self.temp_dir.name) / "focus.db"
        auth_service.SESSIONS.clear()

    def tearDown(self):
        auth_service.SESSIONS.clear()
        self.temp_dir.cleanup()

    def test_ejeme_is_the_only_admin_seed(self):
        admin_token, admin = auth_service.start_session("Ejeme Godwin", "ejeme@example.com", "password123", True)
        learner_token, learner = auth_service.start_session("Jordan Davis", "jordan@example.com", "password123", True)
        duplicate_token, duplicate = auth_service.start_session("Ejeme Godwin", "another@example.com", "password123", True)
        self.assertEqual(auth_service.current_user(admin_token)["role"], "admin")
        self.assertEqual(auth_service.current_user(learner_token)["role"], "learner")
        self.assertEqual(auth_service.current_user(duplicate_token)["role"], "learner")
        self.assertEqual(admin["name"], "Ejeme Godwin")
        self.assertEqual(learner["role"], "learner")

    def test_existing_account_requires_password(self):
        auth_service.start_session("Ejeme Godwin", "ejeme@example.com", "password123", True)
        with self.assertRaises(PermissionError):
            auth_service.start_session("Anything", "ejeme@example.com", "wrongpass")

    def test_existing_account_can_sign_in_without_name(self):
        auth_service.start_session("Jordan Davis", "jordan@example.com", "password123", True)
        token, user = auth_service.start_session("", "JORDAN@example.com", "password123")
        self.assertEqual(user["name"], "Jordan Davis")
        self.assertEqual(auth_service.current_user(token)["email"], "jordan@example.com")

    def test_create_account_requires_explicit_create_mode(self):
        with self.assertRaises(ValueError):
            auth_service.start_session("Jordan Davis", "jordan@example.com", "password123")


if __name__ == "__main__":
    unittest.main()
