import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { isTheme, type Theme } from "@/src/features/settings/api/settings";
import { useUpdateSettings } from "@/src/features/settings/hooks/useSettingsApi";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set<() => void>();

let currentTheme: Theme | undefined;

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved && isTheme(saved) ? saved : "system";
}

function getTheme(): Theme {
  currentTheme ??= getStoredTheme();
  return currentTheme;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => listeners.delete(callback);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    currentTheme = getStoredTheme();
    callback();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function setStoredTheme(theme: Theme): void {
  currentTheme = theme;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }

  for (const listener of listeners) listener();
}

function subscribeToSystemTheme(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia(DARK_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSystemTheme(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
}

function withThemeTransition(update: () => void): void {
  if (typeof document === "undefined") {
    update();
    return;
  }

  const root = document.documentElement;
  root.classList.add("theme-transition");
  update();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove("theme-transition"));
  });
}

/**
 * Shared theme state:
 * - defaults to system;
 * - follows the OS while system is selected;
 * - stays synchronized between hook instances and browser tabs.
 */
export function useTheme() {
  const updateSettings = useUpdateSettings();
  const theme = useSyncExternalStore(
    subscribe,
    getTheme,
    (): Theme => "system",
  );
  const systemIsDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => false,
  );
  const isDark = theme === "system" ? systemIsDark : theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const setTheme = useCallback(
    (value: Theme) => {
      const previousTheme = theme;
      withThemeTransition(() => setStoredTheme(value));

      void updateSettings.mutateAsync({ theme: value }).catch(() => {
        withThemeTransition(() => setStoredTheme(previousTheme));
      });
    },
    [theme, updateSettings],
  );

  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return { theme, setTheme, toggle, isDark };
}
