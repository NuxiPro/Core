import { createLogger } from "@backend/src/logique/logging/logger";
import { plunk } from "./plunk";

const log = createLogger("email/magic-link");

export const sendEmail = async (
  to: string,
  url: string,
  lang: string = "en",
) => {
  try {
    return await plunk.sendMagicLink(to, url, lang);
  } catch {
    log.error("Magic-link email delivery failed");
    throw new Error("Magic-link email delivery failed");
  }
};
