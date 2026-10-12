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
 *  Table de Workspaces - Ici on créer l'espace de travaille de l'user
 * On stocke cette espace dédier à l'user
 */
export const WorkspacesTable = pgTable("workspace", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Table de projects - Ici sera stocker le projet kanban de l'utilisateur
 */
export const projectsTable = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey(),
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
 * Table des tâches - chaque tâche appartient à un utilisateur
 * Le backend remplit toutes les valeurs (id généré, timestamps, userId de la session)
 */
export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey(), // ID généré en UUID v7 par ton backend Hono
    userId: text("user_id") // Identifie le créateur de la tâche (Préparation au multi-user)
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // Si l'user supprime son compte, ses tâches partent avec !
    projectId: uuid("project_id")
      .references(() => projectsTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"), // Description stockée en TEXT (gérée à 50 000 max par ton Zod)
    quadrant: integer("quadrant").notNull(),
    priorityLabel: varchar("priority_label", { length: 10 }),
    positionString: varchar("task_position", { length: 255 })
      .notNull()
      .default("a0"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()) // Met à jour la date automatiquement à chaque modification !
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
 * Table d'archive des tâche - Ici on stocke les tâche archiver des utilisateurs séparer du kanban
 * Cette table retire les tâche dans cardsTable pour la déplacer ici
 */
export const archivedCardsTable = pgTable(
  "archived_cards",
  {
    id: uuid("id").primaryKey(),
    taskId: uuid("task_id").notNull(), // UUID original de la carte dans cardsTable
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .references(() => projectsTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(), // Éléments important pour le trie
    archivedAt: timestamp("archived_at", { mode: "date" })  // Date de la tâches terminée le x j
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
