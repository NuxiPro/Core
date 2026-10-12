import { preventOutside } from "@packages/shared/utils/dialog";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/src/layout/components/ui/dialog";
import { cn } from "@/src/shared/utils/utils";

interface TaskDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxW: string; // ex: "max-w-[480px]" ou "max-w-[640px] sm:max-w-[720px]"
  badge: React.ReactNode;
  extraActions?: React.ReactNode;
  children: React.ReactNode;
  closeLabel: string;
  className?: string;
}

// Shell mutualisé — même overlay, même shadow, même close button
export function TaskDialogShell({
  open,
  onOpenChange,
  maxW,
  badge,
  extraActions,
  children,
  closeLabel,
  className,
}: TaskDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[92vw] bg-card border border-border-subtle rounded-2xl shadow-[0_8px_24px_rgba(17,19,24,0.08),0_32px_64px_rgba(17,19,24,0.12),0_0_0_1px_rgba(17,19,24,0.06)] p-0 gap-0 overflow-hidden [&>button]:hidden flex flex-col",
          maxW,
          className,
        )}
        overlayClassName="bg-[rgba(17,19,24,0.16)] dark:bg-[rgba(0,0,0,0.48)] backdrop-blur-[2px]"
        onPointerDownOutside={preventOutside}
      >
        <div className="flex items-center justify-between px-5 pt-4 shrink-0">
          {badge}
          <div className="flex items-center gap-1">
            {extraActions}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={closeLabel}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
