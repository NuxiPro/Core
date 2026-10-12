import { SpinnerIcon } from "@/src/layout/components/ui/auth-icons";
import { cn } from "@/src/shared/utils/utils";

export const Loader = ({ className }: { className?: string }) => {
  return (
    <SpinnerIcon
      className={cn("size-6 text-muted-foreground", className)}
      title="Chargement"
      titleId="loader-title"
    />
  );
};
