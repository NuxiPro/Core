# Web Frontend

React + Vite + TanStack Router + TanStack Query + Hono RPC client. Details in `../global-doc/frontend/`.

## Run

```bash
bun install          # from repo root (workspaces)
bun run dev          # https://localhost:8787, /api proxied to the backend
bun run build
bun run typecheck
bun run lint
bun run test:run     # vitest, single pass
```

Env comes from `app/web-frontend/.env` (own folder only, never the parent dir): `BACKEND_API_URL`, `BACKEND_AUTH_URL`.

Entry: `main.tsx` → `src/routes/` (file-based routing).
