# MotorMatch

Catálogo inteligente de autos 0km en Uruguay.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite 8 + Tailwind CSS 3 |
| Backend | FastAPI + SQLite |
| Icons | Lucide React |

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- Python 3.11+

## Getting started

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000/api`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # adjust VITE_API_BASE if needed
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment variables (frontend)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `http://localhost:8000/api` | Base URL of the backend API |

## Project structure

```
backend/        FastAPI app + SQLite database
frontend/       Vite + React SPA
  src/
    lib/        API fetch helpers
    hooks/      useCars, useMeta, useDebounce
    components/ FilterSidebar, CarCard, SkeletonCard, Pagination
scripts/        Data ingestion & enrichment utilities
data/           SQLite database (motormatch.db)
```

## Available scripts (frontend)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
