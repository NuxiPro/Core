# Plan — `get-archives.ts` : liste light + détail au clic

> Statut : **plan validé, en attente de go pour le code.**
> Principe directeur : chargement paresseux — le panneau ne charge que ce
> qu'il affiche ; le reste (description) arrive uniquement au clic.
> Zéro fichier créé : `get-archives.ts` est réécrit, une route est ajoutée.

---

## 1. Objectif

Aujourd'hui `getArchivesHandler` fait un `SELECT *` : la **description
voyage sur le réseau pour rien** à chaque ouverture du panneau (elle
n'est affichée nulle part dans la liste). Le plan aligne le endpoint sur
la vision « titre partout, détail au clic » — le même comportement que
le board (`get-task.ts` : liste light + `getTaskById` au clic), dans
**un seul fichier, deux handlers**.

## 2. Forme cible du fichier

```
routes/archive/controler/get-archives.ts
├── getArchivesHandler       → GET /getArchives        (liste light)
│     select({ id, title, archivedAt })  — 3 champs, rien d'autre
│     mapping inline (3 lignes) — PAS serializeArchived (il porte la description)
│
└── getArchiveDetailHandler  → GET /getArchive/{id}    (détail au clic)
      select() complet — la description est le but du endpoint
      serializeArchived(row) réutilisé (il couvre déjà ce format)
```

Même structure que `get-task.ts` (liste + détail côte à côte), même
table, mêmes patterns : ownership `userId` dans le WHERE, garde 404,
dates ISO, logger par rôle.

## 3. Contrats (schémas Zod — `archive.schemas.ts`)

| Schéma | Contenu | Servi par |
|---|---|---|
| `ArchivedTaskSummaryResponse` **(nouveau)** | `id`, `title`, `archivedAt` | liste |
| `ArchivedTaskResponse` (existant, inchangé) | tout, `description` incluse | détail + réponse 201 du POST |

- La liste perd `description`, `projectId`, `userId`, `createdAt` —
  le panneau ne les affiche pas, ils ne voyagent plus.
- ⚠️ Le contrat OpenAPI change → **le miroir frontend bouge dans le
  même commit** (le client typé `hc<AppType>` fera échouer le
  typecheck sinon — c'est le garde-fou voulu).

## 4. Types partagés (`packages/shared/types/task/task.ts`)

- `ArchivedTaskSummary` **(nouveau)** : `{ id; title; archivedAt }` —
  consommé par `ArchiveSheet` (filtre `matchPeriod` sur `archivedAt`,
  recherche et affichage sur `title`).
- `ArchivedTask` (existant) : reste le type du détail (avec
  `description`) — utilisé par la future requête de détail.

## 5. Routeur (`archive.router.ts`) — 1 route ajoutée

```ts
// GET /getArchive/{id} — full detail (description included), loaded on click.
export const getArchiveDetailRoute = createRoute({
  method: "get",
  path: "/getArchive/{id}",
  // … mêmes réponses que les routes sœurs : 200 / 401 / 403 / 404 / 500
});
```

- **Pourquoi `/getArchive/{id}` et pas `/{id}`** : le module nomme ses
  routes par verbe (`/getArchives`, `/restoreArchive/{id}`,
  `/deletedArchive/{id}`) ; un segment littéral distinct évite aussi
  toute ambiguïté de matching avec `/getArchives`.
- Param : `ArchiveIdParam` (existe déjà, UUID v7).
- Middleware : `requirePermission({ archive: ["read"] })` — comme la liste.

## 6. Frontend (miroir, même commit)

1. `features/archive/api.ts` :
   - `getArchivedTasks(projectId)` → `ArchivedTaskSummary[]`
   - `getArchivedTaskDetail(id)` **(nouveau)** → `ArchivedTask`
2. Route `kanban.$projectSlug.archive.tsx` : la query liste passe le
   nouveau type (rien d'autre — l'invalidation ne change pas).
3. `ArchiveSheet` : rangée cliquable → se déplie et fetch le détail
   (react-query, cache par `id`, une seule requête par tâche ouverte).
   Étape UI séparée — elle peut suivre le backend sans le bloquer.

## 7. Ce qui ne change PAS

- `serialize.ts` — il reste le format complet, servi au POST (201) et
  au nouveau handler de détail.
- `archive-task.ts`, `restore.ts` (atterrissage « À faire » validé),
  `deleted-archive.ts` — le module move reste tel quel.
- Le contrat REST existant : mêmes URLs pour les 4 opérations en place.

## 8. Vérifications (workflow habituel)

`bunx biome check --write` · `bun run typecheck` backend **et** frontend
(0 erreur frontend ; backend = les 2 erreurs préexistantes connues) ·
JSON parse des locales si i18n touché · `bun run test` (55/55).

## 9. Effet de bord prévu (déjà acté)

`archived_cards.quadrant` n'a plus de lecteur (le restore va toujours
en « À faire ») → colonne candidate au **drop** dans la migration de
nettoyage, avec `archive_mode` (0003, abandonnée) et vérification du
retrait d'`is_archived`. Migration distincte, accord séparé.
