# Focus

Focus is a code execution visualizer for teaching programming through state: learners can inspect the current line, variables, and call stack at every execution step.

## Current milestone

The repository contains the first frontend slice and a Python tracing proof of concept.

```bash
npm install
npm run dev
```

In a second terminal, start the local trace API:

```bash
source .venv/bin/activate
python backend/server.py
```

The API now owns account roles and sessions. Users can choose **Sign in** for an
existing account or **Create account** for a new one; signing in only requires
the account email and password. The first account registered with
the name `Ejeme Godwin` receives the `admin` role; later accounts receive the
`learner` role. The browser uses the server session rather than trusting a
localStorage role. The local SQLite database is written to `backend/focus.db`.

For sign-in on another device, deploy the API and frontend against the same
server and persistent database. The development server stores accounts in a
SQLite file on the machine running the API, so a separate local copy will not
see those accounts. Learning progress is currently still stored in browser
storage and is not synchronized between devices.

The trace service can also be exercised independently:

```bash
echo '{"code":"x = 1\nx += 2\nprint(x)"}' | python3 backend/trace_service.py
```

The service is for local development only. Requests now execute in a short-lived
child process with best-effort CPU, memory, file-size, descriptor, and timeout
limits. This is not a production sandbox: deploying user code still requires a
container or VM, a read-only filesystem, disabled or isolated networking, and a
carefully controlled runtime.

## Production deployment

The included `render.yaml` deploys the built frontend and Python API as one
same-origin web service. Connect the repository to Render, deploy the blueprint,
then add the purchased domain in the service's Custom Domains settings and
configure the DNS records it provides. The blueprint mounts a persistent disk
for the SQLite account database; migrate to a managed database before scaling
to multiple service instances.

## Next slice

The editor's Run action calls the local trace API through the Vite `/api` proxy,
normalizes trace events into the frontend snapshot shape, and supports animated
playback. The local API now keeps execution out of the HTTP process; the next
engineering slice is production-grade container/VM sandboxing for user code.
