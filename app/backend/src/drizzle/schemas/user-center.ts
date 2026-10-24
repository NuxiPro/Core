import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const userPreference = pgTable("user_preference", {
  id: uuid("id").defaultRandom().primaryKey(),
  user: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: text('theme').notNull().default('system'),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  lang: text("lang").notNull().default("fr"),
  timezone: text("timezone").default("UTC").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userConsent = pgTable("user_consent", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
  termsVersion: text("terms_version").notNull(),
});
