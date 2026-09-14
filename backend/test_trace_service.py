import unittest

from sandbox_runner import TraceExecutionError, run_trace
from trace_service import trace_python


class TracePythonTests(unittest.TestCase):
    def test_assignment_captures_previous_state(self):
        result = trace_python("x = 1\nx += 2")
        self.assertEqual([event["line"] for event in result["steps"]], [1, 2])
        self.assertEqual(result["steps"][-1]["variables"][0]["value"], "1")
        self.assertFalse(result["error"])

    def test_branch_and_loop_trace_executed_lines(self):
        result = trace_python("total = 0\nfor n in [1, 2]:\n    total += n")
        self.assertEqual([event["line"] for event in result["steps"]], [1, 2, 3, 2, 3, 2])

    def test_function_trace_contains_nested_stack(self):
        result = trace_python("def double(n):\n    return n * 2\nanswer = double(3)")
        stacks = [event["stack"] for event in result["steps"]]
        self.assertIn(["<module>", "double"], stacks)

    def test_error_is_returned_without_losing_events(self):
        result = trace_python("value = 1\nprint(missing)")
        self.assertIn("NameError", result["error"])
        self.assertEqual(result["output"], "")

    def test_step_limit_stops_infinite_loop(self):
        result = trace_python("while True:\n    pass", max_steps=4)
        self.assertEqual(len(result["steps"]), 4)
        self.assertTrue(result["truncated"])
        self.assertIsNone(result["error"])

    def test_subprocess_runner_returns_trace(self):
        result = run_trace("value = 7\nvalue += 1")
        self.assertEqual([event["line"] for event in result["steps"]], [1, 2])

    def test_subprocess_runner_enforces_step_limit(self):
        result = run_trace("while True:\n    pass", max_steps=4)
        self.assertEqual(len(result["steps"]), 4)
        self.assertTrue(result["truncated"])

    def test_subprocess_runner_rejects_invalid_step_limit(self):
        with self.assertRaises(ValueError):
            run_trace("x = 1", max_steps=0)


if __name__ == "__main__":
    unittest.main()
