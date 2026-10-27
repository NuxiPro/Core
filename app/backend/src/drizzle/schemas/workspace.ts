import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Workspaces table - Here we create the user's workspace
 * We store this space dedicated to the user
 */
export const WorkspacesTable = pgTable("workspace", {
  id: uuid("id").primaryKey().notNull(),
  name: varchar("name", { length: 30 }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Projects table - The user's kanban project will be stored here
 */
export const projectsTable = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    description: varchar("description", { length: 200 }),
    slug: varchar("slug", { length: 55 }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .references(() => WorkspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("projects_workspaceId_idx").on(table.workspaceId),
    index("projects_userId_updatedAt_idx").on(table.userId, table.updatedAt),
    uniqueIndex("projects_userId_slug_uniq").on(table.userId, table.slug),
  ],
);

/**
 * Tasks table - each task belongs to a user
 * The backend fills in all values (generated id, timestamps, session userId)
 */
export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().notNull(), // ID generated as UUID v7 by your Hono backend
    userId: text("user_id") // Identifies the task creator (preparation for multi-user)
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // If the user deletes their account, their tasks go with it!
    projectId: uuid("project_id")
      .references(() => projectsTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"), // Description stored as TEXT (capped at 50,000 max by your Zod schema)
    quadrant: integer("quadrant").notNull(),
    priorityLabel: varchar("priority_label", { length: 10 }),
    positionString: varchar("task_position", { length: 255 })
      .notNull()
      .default("a0"),
    dueDate: timestamp("due_date", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()) // Automatically updates the date on every change!
      .notNull(),
  },
  (table) => [
    index("cards_projectId_idx").on(table.projectId),
    index("cards_userId_id_idx").on(table.userId, table.id),
    uniqueIndex("cards_userId_projectId_position_uniq").on(
      table.userId,
      table.projectId,
      table.quadrant,
      table.positionString,
    ),
    index("cards_user_quadrant_pos").on(
      table.userId,
      table.quadrant,
      table.positionString,
    ),
  ],
);

/**
 * Archived tasks table - Here we store users' archived tasks separately from the kanban
 * This table removes tasks from cardsTable to move them here
 */
export const archivedCardsTable = pgTable(
  "archived_cards",
  {
    id: uuid("id").primaryKey().notNull(),
    taskId: uuid("task_id").notNull(), // Original UUID of the card in cardsTable
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .references(() => projectsTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(), // Important element for sorting
    archivedAt: timestamp("archived_at", { mode: "date" })  // Date the task was completed
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("archived_cards_userId_archivedAt_idx").on(
      table.userId,
      table.archivedAt,
    ),
    index("archived_cards_projectId_archivedAt_idx").on(
      table.projectId,
      table.archivedAt,
    ),
  ],
);
