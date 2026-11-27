// Neutral high-contrast pill marking the last used option.
// Theme tokens keep the pill high-contrast in both color schemes.
// Floats above the target so it never overlaps the label.
export function LastUsedBadge({ label }: { label: string }) {
  return (
    <span className="absolute -top-3.5 right-3 rounded-full border border-black/20 bg-white px-2.5 py-1 text-xs font-semibold text-black shadow-md shadow-black/40 dark:border-border dark:bg-foreground dark:text-background">
      {label}
    </span>
  );
}
