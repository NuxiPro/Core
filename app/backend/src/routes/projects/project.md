# Plan API Routes — Projects

## Existing routes

| Route | Method | File | Description |
|---|---|---|---|
| `GET /projects` | GET | `list.ts` | List the user's projects |
| `POST /projects/newProjects` | POST | `createProject.ts` | Create a project |
| `GET /projects/:projectId/board` | GET | `get-board.ts` | Full Kanban board |

## Missing routes

| Route | Method | File | Description |
|---|---|---|---|
| `GET /projects/:id` | GET | `getProject.ts` | Project detail |
| `PATCH /projects/:id` | PATCH | `updateProject.ts` | Update a project (name, description) |
| `DELETE /projects/:id` | DELETE | `deleteProject.ts` | Delete a project + its cards |

## Zod schemas

### UpdateProjectInput
```typescript
z.object({
  name: z.string().trim().min(1).max(30).optional(),
  description: z.string().max(200).optional(),
})
```

### ProjectResponse
```typescript
z.object({
  id: z.uuid({ version: "v7" }),
  name: z.string(),
  description: z.string().nullable(),
  prefix: z.string(),
  createdAt: z.string(),
})
```

## Security

- Check `c.get("user")` on each route
- `userId` filter on each DB query
- Cascade delete: project → cards

## Status

| Step | File | Status |
|---|---|---|
| 1 | `getProject.ts` | [ ] To do |
| 2 | `updateProject.ts` | [ ] To do |
| 3 | `deleteProject.ts` | [X] To do |
| 4 | `index.ts` | [ ] To modify |

getProject.ts and updateProject.ts are only for the project settings
