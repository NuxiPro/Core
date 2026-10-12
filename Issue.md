# Issue: concurrent task creation returns 500 on position conflict

## Priority: low (non-blocking)

## Problem

Parallel `POST /api/v1/kanban/:projectId/newTask` requests can fail with
`500 Erreur interne du serveur`.

Root cause (`app/backend/src/routes/kanban/controler/create.ts`):
read-modify-write race. Each transaction reads the last `positionString`,
generates the next fractional-indexing key from it, then inserts. Two
transactions running at the same millisecond read the same last position,
generate the same key, and the loser hits the unique index
`(userId, projectId, quadrant, positionString)` → `500`.

## Why low priority

- A real human creates tasks sequentially (hundreds of ms apart), so each
  create sees the committed last position. Zero conflict.
- Only scripted parallel bursts (e.g. 10 simultaneous creates, AI-type
  intensive user) trigger it. No data corruption: the failed transaction
  rolls back cleanly, no dead tasks, no duplicate positions.
- Measured on a 10-worker storm: 5/10 succeed without retry, 8/10 with the
  current 3-attempt retry. Remaining failures need extreme contention.

## Current mitigation

Bounded retry (3 attempts) on unique conflict in `create.ts`, same pattern
as `MoveTask` (`indexactionTaskV2.ts`). Drizzle wraps the pg error, so the
conflict is matched on message text and error codes at every nesting
level (`23505 | duplicate key | unique constraint`).

## Possible follow-ups (not urgent)

- Return `503` (retryable) instead of generic `500` on exhausted retries,
  like the `fraci` library (`MAX_RETRIES_EXCEEDED`).
- Or serialize creates per project with `SELECT ... FOR UPDATE` (Kaneo
  approach), at the cost of per-project write throughput.
