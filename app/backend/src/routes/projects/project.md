# Plan API Routes — Projects

## Routes existantes

| Route | Méthode | Fichier | Description |
|---|---|---|---|
| `GET /projects` | GET | `list.ts` | Lister les projets de l'utilisateur |
| `POST /projects/newProjects` | POST | `createProject.ts` | Créer un projet |
| `GET /projects/:projectId/board` | GET | `get-board.ts` | Board Kanban complet |

## Routes manquantes

| Route | Méthode | Fichier | Description |
|---|---|---|---|
| `GET /projects/:id` | GET | `getProject.ts` | Détail d'un projet |
| `PATCH /projects/:id` | PATCH | `updateProject.ts` | Modifier un projet (nom, description) |
| `DELETE /projects/:id` | DELETE | `deleteProject.ts` | Supprimer un projet + ses cards |

## Schémas Zod

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

## Sécurité

- Vérifier `c.get("user")` sur chaque route
- Filtre `userId` sur chaque requête DB
- Cascade delete : project → cards

## Statut

| Étape | Fichier | Statut |
|---|---|---|
| 1 | `getProject.ts` | [ ] À faire |
| 2 | `updateProject.ts` | [ ] À faire |
| 3 | `deleteProject.ts` | [X] À faire |
| 4 | `index.ts` | [ ] À modifier |

getProject.ts et updateProject.ts sont fait que pour les setting du projet
