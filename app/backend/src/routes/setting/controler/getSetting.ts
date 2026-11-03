import type { RouteHandler } from "@hono/zod-openapi";
import { userSetting } from "@backend/src/drizzle/schemas";
import { db } from "@backend/src/drizzle/connection";
import { createLogger } from "@packages/shared/utils/logger";
import type { getSettingRoute } from "../setting.router";
import { eq } from "drizzle-orm";
import type { AppEnv } from "@backend/src/types/app-env";

const log = createLogger("Setting/GetSetting");

/**
 * Handler du contrôleur — pattern kaneo : le contrôleur exporte une fonction,
 * l'instance est créée une seule fois par le module (routes/setting/index.ts).
 */
export const getSettingHandler: RouteHandler<typeof getSettingRoute, AppEnv> = async (c) => {
  const user = c.get("user");
  try {
    const [rows] = await db
      .select({
        theme: userSetting.theme,
        emailNotifications: userSetting.emailNotifications,
        language: userSetting.language
      })
      .from(userSetting)
      .where(eq(userSetting.userId, user.id))
      .limit(1);

    return c.json(rows, 200);
  } catch(err) {
    log.error("[Get setting] Error",err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
