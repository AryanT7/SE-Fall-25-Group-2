<!--
Copyright (c) 2025 Group 2
All rights reserved.

This project and its source code are the property of Group 2:
- Aryan Tapkire
- Dilip Irala Narasimhareddy
- Sachi Vyas
- Supraj Gijre
-->

# Cafe Calories (proj2)

A full‑stack project for cafe ordering, delivery, and calorie tracking.

### What it does
- Users browse cafes, add items to cart, place orders, and track calories/goals.
- Owners manage cafes, menus, orders, analytics.
- Drivers update live location and get auto/manual order assignments.

### Tech stack
- Backend: FastAPI, SQLAlchemy, JWT auth, SQLite (default) or PostgreSQL
- Frontend: React + Vite + TypeScript
- Docs: OpenAPI, MkDocs (backend/docs)

## Quick start

### 1) Backend
```bash
cd proj2/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/

Optional: Use PostgreSQL instead of SQLite. See `proj2/backend/DBSetup.md`.

### 2) Frontend
```bash
cd proj2/frontend
npm install
npm run dev
```
- App: http://localhost:5173

By default, the frontend expects the API at `http://localhost:8000`. Update `src/api/client.ts` if needed.

## Common workflows
- Driver assignment end‑to‑end test steps: `proj2/backend/DRIVER_ASSIGNMENT_TESTING.md`
- OCR menu ingestion: `proj2/backend/OCR_README.md`
- Seed sample data: run scripts in `proj2/backend` (e.g., `seed_via_api.py`, `seed_cafes.py`)

## Project structure
```
proj2/
  backend/           # FastAPI service and tests
  frontend/          # React app
```

## Environments
- Development (default): SQLite file `proj2/backend/app.db`
- PostgreSQL: set `POSTGRES_DATABASE_URL` or `DATABASE_URL` (see `DBSetup.md`)

## Testing (backend)
```bash
cd proj2/backend
pytest -q
```

## Documentation
- Backend API docs (runtime): `http://localhost:8000/docs`
- Backend docs site: `proj2/backend/docs` (served via MkDocs)
- High‑level guides:
  - `proj2/backend/DBSetup.md`
  - `proj2/backend/DRIVER_ASSIGNMENT_TESTING.md`
  - `proj2/backend/OCR_README.md`

## License
MIT

## Who should use this software?
- Consumers who want to discover cafes, order food, and track daily/weekly calorie goals.
- Cafe owners and staff who manage menus, accept/prepare orders, and view simple analytics.
- Delivery drivers who report location/status and receive auto/manual order assignments.
- Administrators who oversee accounts, cafes, and platform health.


