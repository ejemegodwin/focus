"""Child-process entry point for the local trace runner."""

from __future__ import annotations

import json
import sys

from trace_service import trace_python


request = json.load(sys.stdin)
print(json.dumps(trace_python(request.get("code", ""), request.get("max_steps", 500))))

