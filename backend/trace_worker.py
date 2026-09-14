"""Child-process entry point for the local trace runner."""

from __future__ import annotations

import json
import sys

from trace_service import trace_go, trace_python


request = json.load(sys.stdin)
language = request.get("language", "python").lower()
if language == "go":
    result = trace_go(request.get("code", ""), request.get("max_steps", 500))
else:
    result = trace_python(request.get("code", ""), request.get("max_steps", 500))
print(json.dumps(result))
