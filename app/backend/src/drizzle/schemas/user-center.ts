import { pgTable, pgEnum ,text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const langEnum = pgEnum("lang", ["fr", "en"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

export const userSetting = pgTable("user_setting", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: themeEnum('theme').default('system').notNull(),
  emailNotifications: boolean("email_notifications").default(false).notNull(),
  language: langEnum("language").notNull().default("en"),
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
