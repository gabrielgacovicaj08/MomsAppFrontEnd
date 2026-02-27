# MomsApp Frontend

React + TypeScript + Vite frontend for MomsApp.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start local dev server
- `npm run lint` — run ESLint
- `npm run build` — type-check + production build
- `npm run preview` — preview production build

## Environment

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_API_BASE_URL` — backend API base URL (example: `https://localhost:7290`)

If not provided, the app falls back to `https://localhost:7290`.

## CI

GitHub Actions workflow (`.github/workflows/frontend-ci.yml`) runs:
1. install (`npm ci`)
2. lint
3. build

on PRs and pushes to `main`.
