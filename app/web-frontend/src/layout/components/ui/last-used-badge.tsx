// Neutral high-contrast pill marking the last used option.
// Fixed colors (never inherits the button's) for low-vision users.
// Floats above the target so it never overlaps the label.
export function LastUsedBadge({ label }: { label: string }) {
  return (
    <span className="absolute -top-2.5 right-3 rounded-full border border-black/20 bg-white px-2 py-0.5 text-[11px] font-semibold text-black shadow-md shadow-black/40">
      {label}
    </span>
  );
}
