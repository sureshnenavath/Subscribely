# Subscribely — Runbook & Quick Start

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

If you prefer Docker, use the compose file in `backend` (if configured):

```powershell
Set-Location -Path .\backend
docker-compose up --build
```

### Run tests

Backend tests (PowerShell):

```powershell
Set-Location -Path .\backend
.\venv\Scripts\Activate
python manage.py test
```

Frontend tests (if available):

```powershell
Set-Location -Path .\frontend
npm test
```

---
## Useful troubleshooting commands

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
- run `npm run build` and report results, or
- start the dev servers and perform a quick smoke test (you'll need to have Docker or local Python/Node available).
