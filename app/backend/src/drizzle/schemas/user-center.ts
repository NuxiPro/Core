import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const langEnum = pgEnum("lang", ["fr", "en"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);
export const archiveModeEnum = pgEnum("archive_mode", ["instant", "time"]);

export const userSetting = pgTable("user_setting", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: themeEnum("theme").default("system").notNull(),
  emailNotifications: boolean("email_notifications").default(false).notNull(),
  language: langEnum("language").notNull().default("en"),
  // Preferred way tasks get archived: by the user ("instant") or
  // automatically after a delay ("time" — engine comes later).
  // pgEnum (comme theme/lang) : le contrat OpenAPI attend l'union exacte,
  // un varchar renverrait un string non assignable.
  archiveMode: archiveModeEnum("archive_mode").default("instant").notNull(),
  // Delay in days for the "time" mode (null = not applicable, "instant").
  archiveDelayDays: integer("archive_delay_days"),
  archiveDueDate: timestamp("archive_due_date", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userConsent = pgTable("user_consent", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  termsAcceptedAt: timestamp("terms_accepted_at", {
    withTimezone: true,
  }).notNull(),
  termsVersion: text("terms_version").notNull(),
});
