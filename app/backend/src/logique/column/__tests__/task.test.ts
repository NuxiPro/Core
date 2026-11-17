import { describe, expect, it } from "bun:test";
import { buildTask } from "../task";

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const projectId = "project-1";

const baseInput = {
  title: "My task",
  description: "Its description",
  colId: "todo" as const,
  priority: "none",
};

describe("buildTask", () => {
  it("generates a UUID v7 id and an ISO 8601 createdAt", () => {
    const task = buildTask(baseInput, projectId);
    expect(task.id).toMatch(UUID_V7_REGEX);
    expect(task.createdAt).toMatch(ISO_REGEX);
  });

  it("preserves all input fields", () => {
    const task = buildTask(baseInput, projectId);
    expect(task).toMatchObject(baseInput);
  });

  it("generates unique ids on each call", () => {
    expect(buildTask(baseInput, projectId).id).not.toBe(
      buildTask(baseInput, projectId).id,
    );
  });

  it("generates 'a0' as default position (null, null)", () => {
    const task = buildTask(baseInput, projectId);
    expect(task.positionString).toBe("a0");
  });

  it("generates a position after 'a0' when prevPosition='a0'", () => {
    const task = buildTask(baseInput, projectId, "a0", null);
    expect(task.positionString).toBe("a1");
    expect(task.positionString > "a0").toBe(true);
  });

  it("generates a position before 'a0' when nextPosition='a0'", () => {
    const task = buildTask(baseInput, projectId, null, "a0");
    expect(task.positionString < "a0").toBe(true);
  });

  it("generates a position between 'a0' and 'a2'", () => {
    const task = buildTask(baseInput, projectId, "a0", "a2");
    expect(task.positionString > "a0").toBe(true);
    expect(task.positionString < "a2").toBe(true);
  });

  it("generates unique positions when parameters differ", () => {
    const task1 = buildTask(baseInput, projectId, null, null); // "a0"
    const task2 = buildTask(baseInput, projectId, "a0", null); // "a1"
    const task3 = buildTask(baseInput, projectId, null, "a0"); // "Z"
    expect(task1.positionString).not.toBe(task2.positionString);
    expect(task2.positionString).not.toBe(task3.positionString);
    expect(task1.positionString).not.toBe(task3.positionString);
  });
});
