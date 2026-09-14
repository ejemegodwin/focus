"""Run a Focus trace in a short-lived, resource-limited child process.

This is a development boundary, not a production sandbox. Production should
run submitted code in a container or VM with a deny-by-default filesystem and
network policy.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


class TraceExecutionError(RuntimeError):
    """Raised when the trace worker cannot return a valid result."""


def _limit_child() -> None:
    """Apply inexpensive POSIX limits before the worker starts."""
    try:
        import resource

        cpu_seconds = 2
        memory_bytes = 256 * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds))
        resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
        resource.setrlimit(resource.RLIMIT_FSIZE, (1 * 1024 * 1024, 1 * 1024 * 1024))
        resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))
        resource.setrlimit(resource.RLIMIT_NPROC, (32, 32))
    except (ImportError, OSError, ValueError):
        # Windows and restricted hosts may not expose these limits. The
        # parent timeout still prevents an indefinitely running request.
        pass


def run_trace(source: str, *, max_steps: int = 500, timeout: float = 3.0) -> dict[str, Any]:
    """Trace source outside the API process and return its JSON result."""
    if not isinstance(source, str) or len(source) > 20_000:
        raise ValueError("code must be a string under 20,000 characters")
    if not 1 <= max_steps <= 2_000:
        raise ValueError("max_steps must be between 1 and 2,000")

    worker = Path(__file__).with_name("trace_worker.py")
    request = json.dumps({"code": source, "max_steps": max_steps})
    try:
        completed = subprocess.run(
            [sys.executable, os.fspath(worker)],
            input=request,
            text=True,
            capture_output=True,
            timeout=timeout,
            cwd=os.fspath(worker.parent),
            env={"PATH": os.environ.get("PATH", ""), "PYTHONIOENCODING": "utf-8"},
            preexec_fn=_limit_child if os.name == "posix" else None,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise TraceExecutionError("Trace timed out. Try a smaller or terminating program.") from error

    if completed.returncode != 0:
        detail = completed.stderr.strip() or "Trace worker exited unexpectedly."
        raise TraceExecutionError(detail[-500:])
    try:
        result = json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        raise TraceExecutionError("Trace worker returned invalid JSON.") from error
    if not isinstance(result, dict) or not isinstance(result.get("steps"), list):
        raise TraceExecutionError("Trace worker returned an invalid result.")
    return result

