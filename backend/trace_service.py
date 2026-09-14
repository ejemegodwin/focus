"""Local development tracer for Focus.

This is intentionally a small proof of concept. It must not be exposed to an
untrusted network: production execution needs a container/VM sandbox with
resource limits and a restricted filesystem.
"""

from __future__ import annotations

import io
import json
import os
import re
import subprocess
import sys
import tempfile
import traceback
from contextlib import redirect_stdout
from types import FrameType
from typing import Any


class TraceLimitExceeded(Exception):
    """Stop submitted code once the learner timeline reaches its limit."""


def explain_error(error: str | None, language: str = "python") -> str | None:
    if not error:
        return None
    if language == "go":
        if "undefined:" in error:
            return "Go could not find this name. Check its spelling and make sure it is declared before use."
        if "syntax error" in error or "expected" in error:
            return "Go could not parse this code. Check braces, parentheses, semicolons, and the surrounding statement."
        if "imported and not used" in error:
            return "Go requires every imported package to be used. Remove the import or use one of its names."
        if "deadcode" in error or "declared and not used" in error:
            return "Go found a declared value that is never used. Remove it or use it in the program."
        if "panic:" in error:
            return "The program stopped because it panicked at runtime. Read the panic value and check the preceding state."
        return "Go could not finish this program. Read the highlighted compiler or runtime message and check the line before it."
    if "NameError" in error:
        return "Python could not find that name. Check its spelling and make sure it is assigned before this line runs."
    if "TypeError" in error:
        return "Python received a value of the wrong type for this operation. Inspect the values and the operation on this line."
    if "IndexError" in error:
        return "This index is outside the sequence. Check the sequence length and remember that indexing starts at zero."
    if "KeyError" in error:
        return "That dictionary key does not exist. Check the available keys or use a safe lookup."
    if "ZeroDivisionError" in error:
        return "The program tried to divide by zero. Check the divisor before performing the calculation."
    if "SyntaxError" in error:
        return "Python could not parse this code. Check punctuation, indentation, and the structure around the reported line."
    if "ValueError" in error:
        return "The value has the right general type but an unusable format. Validate or convert it before this operation."
    return "The program stopped with an error. Start at the reported line and inspect the values it receives."


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

    return {"steps": events, "output": output.getvalue(), "error": error, "error_hint": explain_error(error), "truncated": len(events) >= max_steps}


def _instrument_go(source: str) -> str:
    lines = source.replace("\r\n", "\n").splitlines()
    if not any(line.strip() == "package main" for line in lines):
        raise ValueError("Go visualizations must contain `package main`.")
    result: list[str] = []
    in_import = False
    function_depth = 0
    current_function = "main"
    brace_depth = 0
    for index, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("import"):
            in_import = "(" in stripped and ")" not in stripped
            result.append(line)
            continue
        if in_import:
            result.append(line)
            if ")" in stripped:
                in_import = False
            continue
        function_match = re.search(r"\bfunc\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(", stripped)
        if function_match:
            current_function = function_match.group(1)
        if function_depth and stripped and not stripped.startswith("//") and stripped not in {"}", "{", ")"}:
            result.append(f'\tprintln("__FOCUS_STEP__", {index}, "{current_function}")')
        result.append(line)
        opens = line.count("{")
        closes = line.count("}")
        previous_depth = brace_depth
        brace_depth += opens - closes
        if function_match and opens:
            function_depth = brace_depth
        elif function_depth and brace_depth < function_depth:
            function_depth = 0
    return "\n".join(result) + "\n"


def trace_go(source: str, max_steps: int = 500) -> dict[str, Any]:
    if max_steps < 1:
        raise ValueError("max_steps must be positive")
    source_lines = source.replace("\r\n", "\n").splitlines()
    with tempfile.TemporaryDirectory(prefix="focus-go-") as directory:
        path = os.path.join(directory, "main.go")
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(_instrument_go(source))
        go_cache = os.environ.get("FOCUS_GO_CACHE", "/tmp/focus-go-cache")
        os.makedirs(go_cache, exist_ok=True)
        try:
            completed = subprocess.run(
                ["go", "run", path], capture_output=True, text=True, timeout=30,
                cwd=directory, env={"PATH": os.environ.get("PATH", ""), "GOTOOLCHAIN": "local", "GO111MODULE": "off", "GOCACHE": go_cache, "HOME": "/tmp"}, check=False,
            )
        except FileNotFoundError as error:
            raise RuntimeError("Go is not installed on the trace server.") from error
        except subprocess.TimeoutExpired:
            return {"steps": [], "output": "", "error": "Go trace timed out.", "error_hint": "The Go program did not finish quickly enough. Check for an infinite loop or reduce the input.", "truncated": False}
    events = []
    trace_lines = []
    for raw in completed.stderr.splitlines():
        match = re.search(r"__FOCUS_STEP__\s+(\d+)\s+(\w+)", raw)
        if match:
            trace_lines.append((int(match.group(1)), match.group(2)))
    for line_number, function in trace_lines[:max_steps]:
        code = source_lines[line_number - 1] if line_number <= len(source_lines) else ""
        events.append({"line": line_number, "code": code, "variables": [], "stack": ["global", function]})
    error_lines = [line for line in completed.stderr.splitlines() if "__FOCUS_STEP__" not in line]
    error = "\n".join(error_lines).strip() or None
    truncated = len(trace_lines) > max_steps
    if truncated and not error:
        error = None
    return {"steps": events, "output": completed.stdout, "error": error, "error_hint": explain_error(error, "go"), "truncated": truncated}


if __name__ == "__main__":
    request = json.load(sys.stdin)
    language = request.get("language", "python").lower()
    tracer = trace_go if language == "go" else trace_python
    print(json.dumps(tracer(request.get("code", ""), request.get("max_steps", 500))))
