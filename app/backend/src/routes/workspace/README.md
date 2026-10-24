# Workspace Routes

## Operations

| Operation | Route | Method | Description |
|---|---|---|---|
| Create | `POST /workspaces/newWorkspace` | POST | Create a workspace |
| List | `GET /workspaces` | GET | List the user's workspaces |
| Detail | `GET /workspaces/:id` | GET | Workspace detail |
| Update | `PATCH /workspaces/:id` | PATCH | Rename the workspace |
| Delete | `DELETE /workspaces/:id` | DELETE | Delete the workspace + projects (cascade) + Anti suppression du worspace principal pour éviter de n'avoir aucun workspacep pour l'user |

## Editable fields

| Field | Editable | Reason |
|---|---|---|
| `name` | ✅ Yes | Rename the workspace |
| `userId` | ❌ No | Frozen owner |
| `createdAt` | ❌ No | Frozen creation date |

## Schema

```
Workspace
├── id (UUID v7)
├── name (varchar 30)
├── userId (FK → user)
└── createdAt (timestamp)
```

## Security

- Check `c.get("user")` on each route
- `userId` filter on each DB query
- Cascade delete: workspace → projects → cards

## Status

| Route | File | Status |
|---|---|---|
| `POST /newWorkspace` | `CreateWorkspace.ts` | [X] Done |
| `GET /` | `list.ts` | [X] To do |
| `GET /:id` | `getWorkspace.ts` | [ ] To do |
| `PATCH /:id` | `updateWorkspace.ts` | [ ] To do |
| `DELETE /:id` | `deleteWorkspace.ts` | [ ] To do |
