# Structure

Real code lives in `app/web-frontend/src/`.

```
src/
  routes/          # TanStack Router pages (file-based)
    __root.tsx             # theme + Tooltip + ErrorBoundary + Outlet
    _auth/login.tsx, _auth/register.tsx, _auth/verify-email.tsx
    _dashboard.tsx         # protected layout: sidebar + breadcrumb + Outlet
    _dashboard/index.tsx   # redirects: no workspace -> /onboarding, else -> /kanban
    _dashboard/kanban.tsx  # parent outlet
    _dashboard/kanban.index.tsx
    _dashboard/kanban.$projectSlug.tsx
    _dashboard/kanban.$projectSlug.archive.tsx
    onboarding.tsx
  features/        # business areas, each with api/ + hooks/ + components/
    auth/          # LoginForm, RegisterForm
    board/         # KanbanBoard, columns, task modals, dnd, api/tasks|projects|workspaces, hooks/useTasks|useProjects|useWorkspaces|useReorderTask
    archive/       # ArchiveSheet + api.ts
    onboarding/    # OnboardingWizard + steps/
    settings/      # SettingsDialog, tabs/, hooks/, api/
    i18n/          # i18n setup + locales/en.json, fr.json
  layout/          # app shell only, no business logic
    sidebar/app-sidebar.tsx, nav-user.tsx, nav-projects.tsx, new-project-dialog.tsx
    breadcrumb/app-breadcrumb.tsx
    components/ErrorBoundary.tsx, RoutePending.tsx, RouteTransition.tsx
    components/ui/ # shadcn primitives
  shared/          # cross-feature helpers
    api/handleResponse.ts  # single JSON parse + throw + log
    api/logger.ts
    lib/client.ts          # Hono client + authClient
    lib/queryClient.ts     # global QueryClient defaults
    lib/auth-guard.ts      # resolveSession, waitForSession, handleAuthError
    lib/constants.ts, lib/schemas/
    hooks/useAuth.ts, useTheme.ts, useSyncLanguage.ts, use-mobile.ts, useAsyncHandler.ts
    utils/
```

Rule: new business code goes in `features/<area>/`. Shared UI shell goes in `layout/`. Generic helpers go in `shared/`. Never import from one feature into another; use `shared/` instead.
