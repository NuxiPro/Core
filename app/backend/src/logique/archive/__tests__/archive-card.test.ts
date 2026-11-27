import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

let selectedCard: Record<string, unknown> | null = null;
let settingsRows: Array<{ archiveMode: "instant" | "time" }> = [];
let insertedValues: Record<string, unknown> | undefined;
let deletedCard = false;
let operations: string[] = [];

const tx = {
  select: () => ({
    from: () => ({
      where: async () => (selectedCard ? [selectedCard] : []),
    }),
  }),
  insert: () => ({
    values: (values: Record<string, unknown>) => {
      insertedValues = values;
      return {
        returning: async () => {
          operations.push("insert");
          return [values];
        },
      };
    },
  }),
  delete: () => ({
    where: async () => {
      deletedCard = true;
      operations.push("delete");
    },
  }),
};

const db = {
  transaction: async <T>(run: (transaction: typeof tx) => Promise<T>) =>
    run(tx),
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => settingsRows,
      }),
    }),
  }),
};

mock.module("@backend/src/drizzle/connection", () => ({ db }));
const { archiveCard, getArchiveMode } = await import("../archive-card");

afterAll(() => mock.restore());

beforeEach(() => {
  selectedCard = null;
  settingsRows = [];
  insertedValues = undefined;
  deletedCard = false;
  operations = [];
});

describe("archiveCard", () => {
  it("does nothing when the card is not owned by the user", async () => {
    expect(await archiveCard("task-1", "user-1", "project-1")).toBeNull();
    expect(insertedValues).toBeUndefined();
    expect(deletedCard).toBe(false);
  });

  it("copies the owned card into the archive and then deletes it", async () => {
    selectedCard = {
      id: "task-1",
      userId: "user-1",
      projectId: "project-1",
      title: "Task",
      description: "Details",
      quadrant: 1,
      priorityLabel: "high",
      dueDate: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    const result = await archiveCard("task-1", "user-1", "project-1");

    expect(result).toMatchObject({
      taskId: "task-1",
      userId: "user-1",
      projectId: "project-1",
      title: "Task",
    });
    expect(insertedValues).toMatchObject({
      taskId: "task-1",
      userId: "user-1",
      title: "Task",
    });
    expect(insertedValues?.id).toEqual(expect.any(String));
    expect(insertedValues?.archivedAt).toEqual(expect.any(Date));
    expect(deletedCard).toBe(true);
    expect(operations).toEqual(["insert", "delete"]);
  });
});

describe("getArchiveMode", () => {
  it("defaults to instant when no preference exists", async () => {
    expect(await getArchiveMode("user-1")).toBe("instant");
  });

  it("returns the stored archive preference", async () => {
    settingsRows = [{ archiveMode: "time" }];
    expect(await getArchiveMode("user-1")).toBe("time");
  });
});
