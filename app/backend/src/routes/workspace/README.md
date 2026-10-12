# Routes Workspace

## Opérations

| Opération | Route | Méthode | Description |
|---|---|---|---|
| Créer | `POST /workspaces/newWorkspace` | POST | Créer un workspace |
| Lister | `GET /workspaces` | GET | Lister les workspaces de l'utilisateur |
| Détail | `GET /workspaces/:id` | GET | Détail d'un workspace |
| Modifier | `PATCH /workspaces/:id` | PATCH | Renommer le workspace |
| Supprimer | `DELETE /workspaces/:id` | DELETE | Supprime le workspace + projets (cascade) |

## Champs modifiables

| Champ | Modifiable | Raison |
|---|---|---|
| `name` | ✅ Oui | Renommer le workspace |
| `userId` | ❌ Non | Propriétaire figé |
| `createdAt` | ❌ Non | Date de création figée |

## Schéma

```
Workspace
├── id (UUID v7)
├── name (varchar 30)
├── userId (FK → user)
└── createdAt (timestamp)
```

## Sécurité

- Vérifier `c.get("user")` sur chaque route
- Filtre `userId` sur chaque requête DB
- Cascade delete : workspace → projects → cards

## Statut

| Route | Fichier | Statut |
|---|---|---|
| `POST /newWorkspace` | `CreateWorkspace.ts` | [X] Terminé |
| `GET /` | `list.ts` | [ ] À faire |
| `GET /:id` | `getWorkspace.ts` | [ ] À faire |
| `PATCH /:id` | `updateWorkspace.ts` | [ ] À faire |
| `DELETE /:id` | `deleteWorkspace.ts` | [ ] À faire |
