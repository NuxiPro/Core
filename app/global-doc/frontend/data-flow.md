# Data flow

```
Component -> hook (TanStack Query) -> api function -> Hono client -> backend
```

## 1. Client (`src/shared/lib/client.ts`)

- `client = hc<AppType>(API_URL)` — typed from backend, `credentials: "include"`.
- `authClient = createAuthClient(...)` with magic-link plugin.
- Global fetch wrapper: 401 on `/api/v1` (except auth) -> clear cache + redirect `/login`. 429 -> dispatches `rate-limit` event.

Env names used in code (values stay in `.env`, never documented here): `BACKEND_API_URL`, `BACKEND_AUTH_URL`.

## 2. API functions (`features/*/api/*.ts`)

Thin wrappers around `client.api.v1.*`. Example: `board/api/tasks.ts` (`getBoard`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`, `moveTask`), `board/api/projects.ts`, `board/api/workspaces.ts`.

Every call goes through `handleResponse(response, fallbackMessage, context)`:
- reads `json()` once, returns body if `ok`, else throws `Error(server message || fallback)`.
- logs only `{ status, context }`, never user data.

## 3. Hooks (TanStack Query)

- Global client (`shared/lib/queryClient.ts`): 10 min stale, no refetch on focus/mount, 1 retry.
- `useTasks(projectId)`: query `["board", projectId]` -> `getBoard()`. Mutations (add/update/delete) use optimistic updates via `useOptimisticMutation` + `mergeBoard`.
- `useTaskDetail(taskId)`: query `["task", taskId]`, enabled only if id set (lazy detail load).
- `useProjects()`, `useWorkspaces()`, `useReorderTask()` (drag & drop order).
- Auth: `resolveSession()` for route loaders, `waitForSession(check)` after sign-in/out, `handleAuthError()` on 401.

## 4. UI

Routes call hooks, hooks call api functions. Components never call `client` directly.
