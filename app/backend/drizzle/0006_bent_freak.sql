ALTER TABLE "user_preference" RENAME COLUMN "lang" TO "language";--> statement-breakpoint
ALTER TABLE "user_preference" ALTER COLUMN "email_notifications" SET DEFAULT false;