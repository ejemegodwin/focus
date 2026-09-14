"""Local development tracer for Focus.

This is intentionally a small proof of concept. It must not be exposed to an
untrusted network: production execution needs a container/VM sandbox with
resource limits and a restricted filesystem.
"""

from __future__ import annotations

import io
import json
import sys
import traceback
from contextlib import redirect_stdout
from types import FrameType
from typing import Any


class TraceLimitExceeded(Exception):
    """Stop submitted code once the learner timeline reaches its limit."""


def _safe_value(value: Any) -> str:
    try:
        rendered = repr(value)
    except Exception:
        rendered = "<unavailable>"
    return rendered if len(rendered) <= 160 else rendered[:157] + "..."


def trace_python(source: str, max_steps: int = 500) -> dict[str, Any]:
    """Execute source and return line events with locals and call stack."""
    if max_steps < 1:
        raise ValueError("max_steps must be positive")
    events: list[dict[str, Any]] = []
    output = io.StringIO()
    source_lines = source.splitlines()

    def tracer(frame: FrameType, event: str, arg: Any):
        # Ignore the host process and library internals; only the submitted
        # program belongs in the learner's timeline.
        if frame.f_code.co_filename != "<focus>":
            return None
        if event == "line":
            if len(events) >= max_steps:
                raise TraceLimitExceeded
            stack: list[str] = []
            cursor: FrameType | None = frame
            while cursor is not None:
                if cursor.f_code.co_filename == "<focus>" or cursor.f_code.co_filename == "<string>":
                    stack.append(cursor.f_code.co_name)
                cursor = cursor.f_back
            events.append({
                "line": frame.f_lineno,
                "code": source_lines[frame.f_lineno - 1] if frame.f_lineno <= len(source_lines) else "",
                "variables": [{"name": name, "value": _safe_value(value), "type": type(value).__name__}
                              for name, value in frame.f_locals.items() if not name.startswith("__")],
                "stack": list(reversed(stack)),
            })
        return tracer

    previous = sys.gettrace()
    error = None
    try:
        sys.settrace(tracer)
        with redirect_stdout(output):
            exec(compile(source, "<focus>", "exec"), {"__name__": "__main__"})
    except TraceLimitExceeded:
        pass
    except Exception:
        error = traceback.format_exc(limit=3)
    finally:
        sys.settrace(previous)

    return {"steps": events, "output": output.getvalue(), "error": error, "truncated": len(events) >= max_steps}


if __name__ == "__main__":
    request = json.load(sys.stdin)
    print(json.dumps(trace_python(request.get("code", ""))))
