# Features

## Auth (`features/auth/`, `routes/_auth/`)

- Pages: `/login`, `/register`, `/verify-email`. Forms use react-hook-form + zod (`shared/lib/schemas/auth-schemas.ts`).
- Session from `authClient.useSession`. Protected layout `_dashboard.tsx` loader calls `resolveSession()`, redirects to `/login` if null.
- After sign-in/out, UI waits with `waitForSession()` before navigating.

## Board / Kanban (`features/board/`, `routes/_dashboard/kanban*`)

- Board is per project: `/kanban` -> first project, `/kanban/:projectSlug` -> one board, `/kanban/:projectSlug/archive` -> archived tasks.
- `KanbanBoard` + `column/` (Column, TaskList, ColumnHeader, EmptyState) + `task/modals/` (create/edit) + `dnd/` (drag & drop via dnd-kit).
- Move = `moveTask(id, { colId, overTaskId, insertBefore })`. Client validates `colId`/`overTaskId` format, server computes position.
- List uses light `TaskSummary`; detail modal lazy-loads full `Task`.

## Workspaces & Projects (`board/api/workspaces.ts`, `board/api/projects.ts`)

- `/` loader: no workspace -> redirect `/onboarding`, else -> `/kanban`.
- Sidebar lists projects (`nav-projects.tsx`), create via `new-project-dialog.tsx`.

## Archive (`features/archive/`)

- `ArchiveSheet` + `api.ts`. Separate route under project slug.

## Onboarding (`features/onboarding/`, `routes/onboarding.tsx`)

- `OnboardingWizard` with steps (`WelcomeStep`, `WorkspaceStep`). First-run setup for workspace.

## Settings (`features/settings/`)

- `SettingsDialog` with tabs (General, Profile, Security) + `hooks/useSettings.ts` + `api/` (update-general/profile/notifications). Theme via `useTheme`, language sync via `useSyncLanguage`.

## i18n (`features/i18n/`)

- `i18next` + browser detector, `en` fallback, `fr` available. Synced to user settings after login.
