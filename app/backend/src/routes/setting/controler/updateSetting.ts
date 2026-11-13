import type { RouteHandler } from "@hono/zod-openapi";
import { updateSettingRoute } from "../setting.router";
import type { AppEnv } from "@backend/src/types/app-env";
import { userSetting } from "@backend/src/drizzle/schemas";
import { db } from "@backend/src/drizzle/connection";
import { eq } from "drizzle-orm";
import { createLogger } from "@packages/shared/utils/logger";

const log = createLogger("Setting/update");

export const updateSetting: RouteHandler<typeof updateSettingRoute, AppEnv> = async (c) => {

  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const [update] = await db
      .update(userSetting)
      .set(body)
      .where(eq(userSetting.userId, user.id))
      .returning()


    return c.json(update, 200);
  } catch(err) {
    log.error("[update setting] Error", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
