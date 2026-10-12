import { cn } from "@/src/shared/utils/utils";

export function PremiumLoader({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-card border border-border-subtle p-5 shadow-[0_1px_3px_rgba(17,19,24,0.08),0_8px_24px_rgba(17,19,24,0.10)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)] animate-[loaderEnter_400ms_cubic-bezier(0.25,0.1,0.25,1)_forwards]",
        className,
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Chargement"
    >
      <img
        src="/icon.svg"
        alt=""
        width={32}
        height={32}
        className="size-8 object-contain"
        aria-hidden="true"
      />
    </div>
  );
}
