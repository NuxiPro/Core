import { z } from "@hono/zod-openapi";

export const GetSetting = z.object({
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  language: z.enum(["fr", "en"]),
  archiveMode: z.enum(["instant", "time"]),
  // Only meaningful in "time" mode (null = instant mode / not set).
  archiveDelayDays: z.number().int().min(1).max(90).nullable(),
});

export const ErrorResponse = z.object({ message: z.string() });

export const patchSetting = GetSetting.partial();
