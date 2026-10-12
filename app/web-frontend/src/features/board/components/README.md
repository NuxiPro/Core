# Board components

Structure recommandée :

- `KanbanBoard.tsx` : orchestration globale du board
- `BoardScrollContainer.tsx` : scroll horizontal du board
- `column/` : tout ce qui concerne une colonne
  - `Column.tsx`
  - `ColumnHeader.tsx`
  - `TaskList.tsx`
  - `EmptyState.tsx`
  - `sizing.ts`
  - `useSelectedTask.ts`
- `task/` : tout ce qui concerne une tâche
- `dnd/` : logique de drag and drop

But : garder une hiérarchie simple et facile à parcourir.
