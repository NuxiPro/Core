import { useCallback, useEffect, useState } from "react";

/* Thème stocker dans le cache du navigateurs */
export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("theme");
    if (saved) return saved as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("theme-transition");
      });
    });
  }, []);

  return { theme, toggle };
}
