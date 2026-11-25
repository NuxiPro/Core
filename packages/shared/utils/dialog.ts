/**
 * Prevent closing a Radix Dialog when clicking inside a Popper (Dropdown, etc.).
 * Shared to avoid duplication between TaskModalCreate / TaskModalEdit.
 *
 * Structural type instead of `HTMLElement` on purpose: this file lives in
 * packages/shared, which the backend also compiles — with no DOM lib. The
 * shape below is all we need, and it typechecks in both contexts.
 */
type ClickTarget = { closest?: (selector: string) => unknown };

export const preventOutside = (e: Event): void => {
  const target = e.target as ClickTarget | null | undefined;
  if (target?.closest?.("[data-radix-popper-content-wrapper]")) {
    e.preventDefault();
  }
};
