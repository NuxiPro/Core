import { useCallback, useEffect, useState } from "react";
import { isTheme, type Theme } from "@/src/features/settings/api/settings";

/** Media query de l'OS pour le thème système (prefers-color-scheme). */
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Valeur stockée : "light", "dark" ou "system". Absente/invalide → "system"
 * (nouvel utilisateur ou ancien format : on suit l'OS, choix le plus neutre).
 */
function resolveTheme(saved: string | null): Theme {
  if (saved !== null && isTheme(saved)) return saved;
  return "system";
}

/** Thème "system" → suit la préférence de l'OS ; sinon le thème choisi. */
const prefersDark = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;

const isDarkFor = (theme: Theme): boolean =>
  theme === "system" ? prefersDark() : theme === "dark";

/** Anime les transitions CSS autour d'un changement de thème (cf. global.css). */
function withThemeTransition(update: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  update();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove("theme-transition"));
  });
}

/**
 * Mini système de thème :
 * - source de vérité = state `theme` (persisté dans localStorage) ;
 * - effet unique : applique/dé-ré-applique `html.dark`, réactif à l'OS
 *   tant que le thème vaut "system" (listener sur prefers-color-scheme) ;
 * - `toggle` = bascule rapide light/dark, `setTheme` = choix explicite.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : resolveTheme(localStorage.getItem("theme")),
  );
  const [isDark, setIsDark] = useState<boolean>(() => isDarkFor(theme));

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const mq = window.matchMedia(DARK_QUERY);
    const apply = () => {
      const dark = theme === "system" ? mq.matches : theme === "dark";
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };
    apply();
    if (theme !== "system") return;
    // Le changement de préférence OS s'applique en temps réel
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    withThemeTransition(() => setThemeState(value));
  }, []);

  // Bascule rapide : à partir de "system", passe à l'inverse du thème OS courant
  const toggle = useCallback(() => {
    withThemeTransition(() => setThemeState((t) => (isDarkFor(t) ? "light" : "dark")));
  }, []);

  return { theme, setTheme, toggle, isDark };
}
