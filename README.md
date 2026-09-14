# Focus

Focus is a code-execution visualizer for teaching programming through program state. Learners can run Python code and inspect execution steps, the current line, variables, output, and call stack. It also includes guided learning paths, interactive exercises, learner progress, account authentication, and an admin activity dashboard.

## Features

### Visualizer

- Runs Python code through the trace API.
- Displays each execution event as a navigable snapshot.
- Shows the current line with a plain-language line guide.
- Displays variables, values, types, and the call stack.
- Supports play, pause, previous step, next step, reset, and animated playback.
- Captures program output and runtime errors.

### Learning paths

- Structured Python lessons from beginner to intermediate concepts.
- Explanations, worked examples, objectives, pitfalls, hints, and exercises.
- Exercises must pass before the next lesson is unlocked.
- Tracks completed lessons, challenge count, visualized steps, and streak data.

### Accounts

- New users can create an account with a name, email, and password.
- Existing users can sign in from another device with their email and password.
- Sessions use an HttpOnly cookie managed by the API.
- Passwords use PBKDF2-HMAC-SHA256 with a per-user salt.
- Admin access is assigned to emails listed in `FOCUS_ADMIN_EMAILS`.
- Later accounts receive the learner role.

### Dashboards

Learners can view their streak, visualized steps, completed challenges, and
learning paths. Admin users can view recorded activity, recent learners,
completion percentages, system activity, and export activity as CSV.

## Technology

- React with Vite
- React DOM and Lucide React
- Python standard-library HTTP server
- Python tracing with `sys.settrace`
- SQLite for local account storage
- Browser local storage for client-side progress and drafts
- Render Blueprint configuration for deployment

## Project structure

```text
focus/
├── backend/
│   ├── auth_service.py       Account, password, and session logic
│   ├── server.py             HTTP API and production frontend server
│   ├── sandbox_runner.py     Short-lived trace execution runner
│   ├── trace_service.py      Trace service entry point
│   ├── trace_worker.py       Isolated tracing worker
│   ├── test_auth_service.py  Authentication tests
│   └── test_trace_service.py Trace tests
├── src/
│   ├── main.jsx              Main React application
│   ├── styles.css             Application styles
│   ├── trace.js               Trace API client and normalizer
│   └── courses.js             Course and lesson data
├── render.yaml                Render deployment definition
├── vite.config.js             Vite configuration and local API proxy
├── package.json               Frontend scripts and dependencies
└── index.html                 Browser entry point
```

## Requirements

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- Git

## Run locally

Clone the repository and enter the project directory:

```bash
git clone https://github.com/ejemegodwin/focus.git
cd focus
```

Install frontend dependencies:

```bash
npm install
```

Create or activate a Python virtual environment if needed:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Start the API in one terminal:

```bash
python backend/server.py
```

Start Vite in a second terminal:

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The Vite
development server proxies `/api` requests to `http://localhost:8000`.

## Useful commands

```bash
npm run dev          # Start the Vite development server
npm run build        # Create the production frontend build
npm run preview      # Preview the production frontend build
npm run test:backend # Run all Python backend tests
```

Run the trace service directly:

```bash
echo '{"code":"x = 1\nx += 2\nprint(x)"}' | python3 backend/trace_service.py
```

## Authentication

For a new user, choose **Create account**, then enter a name, email, password,
and password confirmation. Passwords must contain at least eight characters.

For an existing user, choose **Sign in** and enter the account email and
password. A name is not required. The same credentials work from another
device when both devices use the same deployed API and database.

The development database is stored at `backend/focus.db` and is ignored by
Git. Use another location with:

```bash
FOCUS_DB_PATH=/path/to/focus.db python backend/server.py
```

Set the comma-separated admin email allowlist when running the API:

```bash
FOCUS_ADMIN_EMAILS=ejeme@example.com python backend/server.py
```

To reset local accounts, stop the API and remove `backend/focus.db`.

## API endpoints

### `GET /ready`

Returns a readiness response for deployment health checks.

### `GET /api/auth/me`

Returns the authenticated user, or `null` when no valid session exists.

### `POST /api/auth/session`

Creates an account or starts a session.

Create an account:

```json
{
  "name": "Jordan Davis",
  "email": "jordan@example.com",
  "password": "password123",
  "create_account": true
}
```

Sign in:

```json
{
  "email": "jordan@example.com",
  "password": "password123",
  "create_account": false
}
```

### `DELETE /api/auth/session`

Ends the current session and clears its cookie.

### `POST /api/trace`

Runs a Python trace request:

```json
{
  "code": "x = 1\nprint(x)",
  "max_steps": 500
}
```

Code is limited to 20,000 characters. `max_steps` must be between 1 and 2,000.

## Production deployment

The included `render.yaml` deploys the built React frontend and Python API as
one same-origin Render web service. This lets production use `/api/auth` and
`/api/trace` without the Vite development proxy.

### Render

1. Push the repository to GitHub.
2. Create a Render account.
3. Choose **New → Blueprint**.
4. Select this repository.
5. Render reads `render.yaml` and runs:

   ```bash
   npm ci && npm run build
   ```

6. The service starts with `python3 backend/server.py`.
7. Add a custom domain in the service's **Custom Domains** settings.
8. Add the DNS records Render provides at your domain registrar.

The server uses the platform `PORT` value and binds to `0.0.0.0` in production.
Render provides HTTPS for configured custom domains.

### Database storage

The deployment blueprint mounts a persistent disk at `/var/data` and stores the
SQLite database at `/var/data/focus.db`. This is suitable for a small,
single-service deployment. Before scaling to multiple instances, migrate to a
managed database such as PostgreSQL.

## Security and sandbox limitations

The trace runner executes user code in a short-lived child process with
best-effort CPU, memory, file-size, descriptor, and timeout limits. This is
appropriate for local development and an early prototype, but it is not a
complete production sandbox.

Before exposing code execution publicly, use a dedicated container or VM with:

- A read-only filesystem where possible
- Disabled or isolated networking
- Strict CPU, memory, process, and file limits
- A non-root runtime user
- No access to application secrets
- Separate execution workers and monitoring
- Production-grade database and session-secret management

Do not deploy the current trace runner as an unrestricted public code-execution
service without these protections.

## Current limitations

- Learning progress is stored in browser local storage and is not synchronized
  between devices.
- Admin analytics are currently recorded in browser local storage.
- SQLite is intended for development or a small single-service deployment.
- Account recovery, email verification, password reset, and MFA are not yet
  implemented.
- Python and Go are supported by the visualizer. Go tracing requires the Go
  toolchain to be installed on the API host.

## License

No license has been selected yet.
