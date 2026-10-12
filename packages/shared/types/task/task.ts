// packages/shared/types/task.ts
import type { ColumnId } from "../../config/index";
import type { PriorityLabel } from "./priority-level";

/**
 * Information de la tâches
 */
export type Task = {
  id: string;               // UUID V7 de la tâche qui et générer par le backend
  colId: ColumnId;          // Id de la colonne en chaine de caractère
  title: string;
  description?: string;
  userId: string;           // Propriétaire de la tâches
  priority?: PriorityLabel; // Priorité de la tâche
  Isarchived?: boolean;     // Status d'archive de la tâches
  positionString: string;   // Position de la tâche (fractional indexing)
  dueDate?: string;         // Date d'échéance optionnelle (ex: "2026-09-30")
  createdAt: string;        // Création de date au moment de créer une tâche
  updatedAt?: string;       // Date de modification optionnel
};

/**
 * Vue dédiée aux tâches archivées dans le panneau latéral (Sheet)
 */
export type ArchivedTask = {
  id: Task['id'];
  title: Task["title"];
  description?: Task["description"];
  userId: Task["userId"];
  archivedAt: string;      // Requis : Date effective d'archivage
  createdAt: Task["createdAt"];
};


/** Résumé allégé pour la liste initiale (id + title max 255 octets) */
export type TaskSummary = Pick<
  Task,
  "id" | "title" | "colId" | "createdAt" | "positionString" | "priority"
>;

// Ce que le client envoie pour la création
export type CreateTaskInput = Pick<Task, "title" | "colId">;

// Payload du drag & drop : changement de colonne
export type MoveTaskInput = Pick<Task, "id" | "colId">;
