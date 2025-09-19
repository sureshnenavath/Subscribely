# Subscribely — Runbook & Quick Start

Project: Subscribely

Tools: Django, React, Vite, Tailwind CSS, SQLite (dev)

Author: Nenavath Suresh — https://github.com/sureshnenavath/Subscribely

This short README focuses on how to run the project locally (PowerShell examples) and quick checks for the two key flows (authentication and payments).

Repository layout (top-level):
- `backend/` — Django REST API + Razorpay integration (SQLite dev DB)
- `frontend/` — React (Vite) single-page app (ReactJS / JSX)

---
## Quick commands (PowerShell)

Open a PowerShell window and use the commands below from the repository root.

### Backend (Django)

1) Enter backend folder and create/activate virtualenv:

```powershell
Set-Location -Path .\backend
python -m venv venv
.\venv\Scripts\Activate
```

2) Install dependencies and run migrations:

```powershell
pip install -r requirements.txt
python manage.py migrate
```

3) (Optional) Load fixtures and create a superuser:

```powershell
python manage.py loaddata fixtures/initial_data.json
python manage.py createsuperuser
```

4) Run dev server (bind to all interfaces on port 8000):

```powershell
python manage.py runserver 0.0.0.0:8000
```

Backend API base URL: http://localhost:8000

### Frontend (ReactJS + Vite)

Open a separate PowerShell window and run:

```powershell
Set-Location -Path .\frontend
npm install
npm run dev    # start dev server (Vite) — default port 5173
# or build for production
npm run build
```

When developing, ensure the backend (`http://localhost:8000`) is running so API calls work.

### Run with Docker (optional)

If you prefer Docker, there is a production-ready `backend/Dockerfile.prod` and a CI workflow that builds and publishes an image to GitHub Container Registry (GHCR). To run locally with Docker Desktop installed:

```powershell
Set-Location -Path .\backend
docker build -t subscribely-backend:local -f Dockerfile.prod .
docker run -p 8000:8000 --env-file .env subscribely-backend:local
```

Ensure `.env` contains required variables (SECRET_KEY, DATABASE_URL if using Postgres, RAZORPAY keys, etc.). If `DATABASE_URL` is not provided the project will use the local `db.sqlite3` for development.

### Deployment (short)

CI: I added a GitHub Actions workflow at `.github/workflows/backend-build-and-push.yml` that builds `backend/Dockerfile.prod` and pushes the image to GitHub Container Registry (GHCR) as `ghcr.io/<owner>/subscribely-backend:latest` on pushes to `main`.

Options to host the backend (free/low-cost tiers):
- Render (easy Docker/GitHub deploy, managed Postgres available)
- Fly.io (container-first platform, generous free tier)
- Railway (quick database + web service)

Typical deploy steps:
1. Push to `main` to trigger the workflow which builds and publishes the backend image to GHCR.
2. On Render/Fly, create a new web service and point it to the GHCR image (or connect the repo directly).
3. Add environment variables (SECRET_KEY, DEBUG=False, ALLOWED_HOSTS, DATABASE_URL, RAZORPAY keys) in the host UI.
4. Ensure CORS/ALLOWED_HOSTS include your frontend domain (for Netlify: `https://<your-site>.netlify.app`).

If you want, I can add a `render.yaml` or `fly.toml` for one-click deploys, or add CI steps to automatically deploy to a chosen provider.

## Netlify frontend: configure environment variables

When deploying the frontend to Netlify you should set the API base URL as a build environment variable so the production bundle knows where to call your backend.

- Variable name (Vite): VITE_API_BASE_URL
- Example value (Render backend): https://subscribely-backend.onrender.com/api

Steps:
1. In Netlify, open your site → Site settings → Build & deploy → Environment → Environment variables.
2. Add `VITE_API_BASE_URL` with the backend base URL (include the `/api` path if your frontend expects `/api` as the mount point).
3. Trigger a deploy (rebuild) — Netlify will include the value at build time and your production bundle will use it.

Proxy alternative (optional): If you prefer not to set a build-time variable you can configure Netlify to proxy API calls to your backend using a `_redirects` file placed in `frontend/public` or the built `dist`:

```
/api/*  https://subscribely-backend.onrender.com/:splat  200
```

This keeps the frontend calling `/api/...` in production while Netlify forwards those requests to your backend host. Remember to configure CORS on the backend to allow the Netlify domain if you do not proxy.


- List any remaining TypeScript files under `frontend/src`:

```powershell
Get-ChildItem -Path .\frontend\src -Recurse -Include *.ts,*.tsx | Select-Object FullName
```

- Show Vite dev server output (run in the frontend folder when dev server is running):

```powershell
npm run dev
```

- Check backend logs in the Django terminal for webhook/auth errors.

---
## Key behaviors to validate

- Login: the frontend sends `{ identifier, password }` and the backend accepts either an email or a username in `identifier`.
  - Example payload: `{ "identifier": "user@example.com", "password": "secret" }`.

- Payments: payment objects returned by `GET /api/payments/` include `razorpay_payment_id` (the transaction id). The frontend Payments UI displays that field.

---
## Where to look if something breaks

- Frontend source: `frontend/src` (JSX/JS files)
- Frontend backups of original TSX: `frontend/backup-tsx`
- Backend Django app: `backend/` (manage.py, settings, apps)

---
If you'd like, I can now:
- finish the TypeScript purge under `frontend/src` (move any remaining .ts/.tsx files to `frontend/backup-tsx`),
- add `render.yaml` or `fly.toml` and instructions for one-command deploys, or
- create a small README section showing how to pull the GHCR image and deploy it to Render.

## Deployment notes (cookies, CORS, CSRF)

If your frontend is deployed on a different origin than your backend (common with Netlify + Render), browsers will treat requests as cross-site. The app uses HttpOnly JWT cookies for authentication which requires two things to work in production:

- The browser must allow sending cookies on cross-site requests (frontend must send requests with credentials and backend must set CORS to allow credentials).
- The cookie must be set with SameSite=None and Secure attributes so modern browsers will include it in cross-site requests over HTTPS.

Checklist for Render (backend) + Netlify (frontend):

1. On Netlify set `VITE_API_BASE_URL` to your backend API base (e.g. `https://subscribely.onrender.com/api`) and rebuild the site.
2. On Render ensure these env vars are set in the service:
  - `DEBUG=False`
  - `ALLOWED_HOSTS=subscribely.onrender.com` (or comma-separated hosts)
  - `CSRF_TRUSTED_ORIGINS=https://subscribely.netlify.app` (if not already present)
  - `CORS_ALLOWED_ORIGINS=https://subscribely.netlify.app` (if not already present)
  - Optionally: `JWT_AUTH_SECURE=True` and `JWT_AUTH_SAMESITE=None` (the settings default to these in production if DEBUG=False)
3. Confirm the frontend's axios instance uses `withCredentials: true` (it does by default in this repo).
4. If you use a proxy configuration (Netlify _redirects) ensure CORS is not needed because requests will be same-origin.

Troubleshooting tips:

- If login appears to succeed but you are immediately redirected to the login page, open the browser devtools → Network and check the response to `/auth/login/` — make sure the response includes `Set-Cookie` headers and that the cookie attributes include `SameSite=None; Secure`.
- If `Set-Cookie` is present but the browser does not store the cookie, it's usually because `Secure` is required for SameSite=None; ensure your backend uses HTTPS in production.
- After logout, if a new signup does not appear in the admin, check backend logs for errors and ensure the frontend is sending the correct payload and that the request is not blocked by CORS/CSRF.

If you'd like, I can add a small deploy script or a Render `render.yaml` that documents these environment variables and automates a correct configuration.
