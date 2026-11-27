import { createLogger } from "../logging/logger";
import {
  type Lang,
  type LanguageSource,
  StepDefaultSettings,
} from "./01-ensure-default-settings";

export async function seedAccountDefaults(user: {
  id: string;
  email: string;
  language?: Lang;
  languageSource?: LanguageSource;
}) {
  const log = createLogger("init user account");
  log.info("Start init user account");
  await Promise.allSettled([StepDefaultSettings(user)]);
}
