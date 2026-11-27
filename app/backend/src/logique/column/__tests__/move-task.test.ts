import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

let selectedRows: unknown[][] = [];
let transactionStarted = false;

const tx = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => selectedRows.shift() ?? [],
      }),
    }),
  }),
};

const db = {
  transaction: async <T>(run: (transaction: typeof tx) => Promise<T>) => {
    transactionStarted = true;
    return run(tx);
  },
};

mock.module("@backend/src/drizzle/connection", () => ({ db }));
const { MoveTask, PositionImpossibleError } = await import(
  "../indexactionTaskV2"
);

afterAll(() => mock.restore());

beforeEach(() => {
  selectedRows = [];
  transactionStarted = false;
});

describe("MoveTask validation", () => {
  it("rejects a missing target column before opening a transaction", async () => {
   expect(
      MoveTask("task-1", "user-1", "" as never, null, false),
    ).rejects.toThrow("MISSING_TARGET_COLUMN");
    expect(transactionStarted).toBe(false);
  });

  it("rejects dropping a task onto itself", async () => {
    selectedRows = [[{ id: "task-1", projectId: "project-1" }]];

   expect(
      MoveTask("task-1", "user-1", "todo", "task-1", true),
    ).rejects.toBeInstanceOf(PositionImpossibleError);
  });

  it("rejects a neighbor from another project", async () => {
    selectedRows = [
      [{ id: "task-1", projectId: "project-1" }],
      [{ projectId: "project-2", quadrant: 1, positionString: "a0" }],
    ];

   expect(
      MoveTask("task-1", "user-1", "todo", "task-2", true),
    ).rejects.toBeInstanceOf(PositionImpossibleError);
  });
});
