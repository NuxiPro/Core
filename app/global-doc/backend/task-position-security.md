# Task position security (V2)

Rule: the client proposes where it dropped, the server decides if allowed and computes the position. The client never sends positions.

## Visual

```
Browser (drag & drop)
  │  sends only: { colId, overTaskId, insertBefore }
  ▼  PATCH /api/v1/matrice/updateTaskPosition/{id}
Server (MoveTask, one transaction)
  │  1. task exists + mine?        → else 404
  │  2. overTask exists + mine + same project?  → else 404 / 409
  │  3. resolve prev/next (max 2 rows, indexed, no column scan)
  │  4. newPos = generateKeyBetween(prev, next)
  │     positions too long (>180)? → rebalance first
  │  5. UPDATE ... WHERE id + userId
  │     unique conflict (23505)? → rebalance + retry once
  ▼  200 { success, newPosition }
```

## Drop cases

| Drop | `overTaskId` | `insertBefore` | `(prev, next)` |
|------|--------------|----------------|----------------|
| Above first card | first id | true | (null, overPos) |
| Below last card | last id | false | (overPos, null) |
| Between two cards | hovered id | true/false | (prev, overPos) / (overPos, next) |
| Empty column | null | — | (null, null) → `a0` |

## Cost

Normal move = 4 indexed ops (validate task, validate overTask, resolve neighbor, update). No full-column scan. Rebalance (rewrite positions tightly) happens only when keys grow too long or on unique conflict.

## Why not client-computed positions

A client-sent position could reference another user's task and move cards into someone else's column. Ownership is checked server-side on every id (`WHERE id + userId`, same-project check), so stolen ids return 404/409.

## Contract

`PATCH /api/v1/matrice/updateTaskPosition/{id}` — body `{ colId, overTaskId: uuid|null, insertBefore: boolean }` → 200 `{ success, newPosition }`, else 400/401/404/409/500.
