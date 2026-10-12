import { describe, expect, it } from "bun:test";
import { buildTask } from "../task";

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const baseInput = {
  title: "Ma tâche",
  description: "Sa description",
  colId: "todo" as const,
  priority: "none",
};

describe("buildTask", () => {
  it("génère un id UUID v7 et un createdAt ISO 8601", () => {
    const task = buildTask(baseInput);
    expect(task.id).toMatch(UUID_V7_REGEX);
    expect(task.createdAt).toMatch(ISO_REGEX);
  });

  it("préserve tous les champs de l'input", () => {
    const task = buildTask(baseInput);
    expect(task).toMatchObject(baseInput);
  });

  it("génère des ids uniques à chaque appel", () => {
    expect(buildTask(baseInput).id).not.toBe(buildTask(baseInput).id);
  });

  it("génère 'a0' comme position par défaut (null, null)", () => {
    const task = buildTask(baseInput);
    expect(task.positionString).toBe("a0");
  });

  it("génère une position après 'a0' quand prevPosition='a0'", () => {
    const task = buildTask(baseInput, "a0", null);
    expect(task.positionString).toBe("a1");
    expect(task.positionString > "a0").toBe(true);
  });

  it("génère une position avant 'a0' quand nextPosition='a0'", () => {
    const task = buildTask(baseInput, null, "a0");
    expect(task.positionString < "a0").toBe(true);
  });

  it("génère une position entre 'a0' et 'a2'", () => {
    const task = buildTask(baseInput, "a0", "a2");
    expect(task.positionString > "a0").toBe(true);
    expect(task.positionString < "a2").toBe(true);
  });

  it("génère des positions uniques quand les paramètres diffèrent", () => {
    const task1 = buildTask(baseInput, null, null); // "a0"
    const task2 = buildTask(baseInput, "a0", null); // "a1"
    const task3 = buildTask(baseInput, null, "a0"); // "Z"
    expect(task1.positionString).not.toBe(task2.positionString);
    expect(task2.positionString).not.toBe(task3.positionString);
    expect(task1.positionString).not.toBe(task3.positionString);
  });
});
