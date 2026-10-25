/**
 * This file is not finish but don't use it actually
 */

import { db } from "@backend/src/drizzle/connection";
import { userPreference } from "@backend/src/drizzle/schemas";
import { eq } from "drizzle-orm";

const userId = c.get("userId");

const userSettings = await db
  .select({ lang: userPreference.lang })
  .from(userPreference)
  .where(eq(userPreference.userId, userId))
  .limit(1);

console.log("Résultat brut de la DB :", userSettings);

const userLang = userSettings[0]?.lang ?? "en";
console.log("Langue retenue :", userLang);
