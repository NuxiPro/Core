/**
 * Prevent closing a Radix Dialog when clicking inside a Popper (Dropdown, etc.).
 * Shared to avoid duplication between TaskModalCreate / TaskModalEdit.
 */
export const preventOutside = (e: Event): void => {
  if ((e.target as HTMLElement)?.closest("[data-radix-popper-content-wrapper]")) {
    e.preventDefault();
  }
};
