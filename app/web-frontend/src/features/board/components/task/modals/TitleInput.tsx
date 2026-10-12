import { TITLE_MAX } from "@/src/shared/lib/constants";
import { cn } from "@/src/shared/utils/utils";

interface TitleInputProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  className?: string;
}

// Input titre partagé — slice TITLE_MAX + compteur
export function TitleInput({
  id,
  value,
  onChange,
  placeholder,
  autoFocus,
  className,
}: TitleInputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, TITLE_MAX))}
        placeholder={placeholder}
        className={cn(
          "w-full bg-background border border-border rounded-xl px-3.5 py-3 text-[15px] font-medium leading-5 text-foreground placeholder:text-text-muted-hard outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          className,
        )}
      />
    </div>
  );
}

export function TitleCounter({ len }: { len: number }) {
  if (len <= TITLE_MAX - 40) return null;
  return (
    <span
      className={cn(
        "text-xs font-mono tabular-nums",
        len >= TITLE_MAX
          ? "text-destructive"
          : len > TITLE_MAX - 20
            ? "text-amber-600"
            : "text-muted-foreground",
      )}
    >
      {len}/{TITLE_MAX}
    </span>
  );
}
