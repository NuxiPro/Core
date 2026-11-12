import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "./features/i18n";

// Radix renders dialogs in a portal. Ensure every test starts with a clean DOM.
afterEach(cleanup);

/** Minimal matchMedia implementation for jsdom. */
function createMatchMedia(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  };
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = createMatchMedia;
}
