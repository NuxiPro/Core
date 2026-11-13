import { createLogger } from "@packages/shared/utils/logger";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const log = createLogger("i18n");

export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;
// Diagnostic : permet d'identifier une langue détectée sans ressource,
// une clé absente ou un fallback vers l'anglais.
i18n
  .on("initialized", (options) => {
    log.debug("Initialized", {
      language: i18n.language,
      resolvedLanguage: i18n.resolvedLanguage,
      fallbackLng: options?.fallbackLng,
      resources: Object.keys(i18n.options.resources ?? {}),
    });
  })
  .on("languageChanged", (language) => {
    log.debug("Language changed", {
      language,
      resolvedLanguage: i18n.resolvedLanguage,
      hasResourceBundle: i18n.hasResourceBundle(
        i18n.resolvedLanguage ?? language,
        "translation",
      ),
    });
  })
  .on("missingKey", (languages, namespace, key, fallbackValue) => {
    log.debug("Missing translation key — possible fallback", {
      languages,
      namespace,
      key,
      fallbackValue,
    });
  })
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })
  .catch((error: unknown) => {
    log.error("Initialization failed", error);
  });

export default i18n;
