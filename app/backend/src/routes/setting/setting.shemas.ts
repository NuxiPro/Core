import { z } from "@hono/zod-openapi";

export const GetSetting = z.object({
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  language: z.enum(["fr", "en"]),
});

export const ErrorResponse = z.object({ message: z.string() });

export const patchSetting = GetSetting.partial();
