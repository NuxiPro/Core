# Frontend

Web app in `app/web-frontend/`. React + Vite + TanStack Router + TanStack Query + Hono RPC client.

## Stack

- React 19, Vite, Tailwind, shadcn/ui
- TanStack Router (file-based, see `src/routes/`), TanStack Query
- Hono client (`hc<AppType>`) for type-safe API calls, `better-auth` for session
- react-hook-form + zod for forms, i18next (en/fr), dnd-kit for drag & drop

## Run

```bash
bun install
bun run dev      # Vite dev on :8787, proxies /api to backend
bun run build
bun run typecheck
bun run lint
bun run test:run
```

Entry: `main.tsx` -> QueryClientProvider + RouterProvider.

## Docs

- [`structure.md`](./structure.md) — folders and where to put code
- [`data-flow.md`](./data-flow.md) — API client -> hooks -> UI
- [`features.md`](./features.md) — auth, board, workspaces/projects, archive, onboarding, settings, i18n
