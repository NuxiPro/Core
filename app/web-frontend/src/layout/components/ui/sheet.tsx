"use client";

import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/src/shared/utils/utils";
import { Button } from "./button";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-[var(--dialog-overlay)] data-[state=open]:animate-[overlayShow_300ms_cubic-bezier(0.25,0.1,0.25,1)] data-[state=closed]:animate-[overlayShow_300ms_cubic-bezier(0.4,0,1,1)_reverse]"
      />
      <SheetPrimitive.Content
        key={side}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col transition-transform duration-300 ease-out data-[side=right]:right-0 data-[side=left]:left-0 data-[side=left]:data-[state=closed]:-translate-x-full data-[side=left]:data-[state=open]:translate-x-0 data-[side=right]:data-[state=closed]:translate-x-full data-[side=right]:data-[state=open]:translate-x-0 data-[side=top]:data-[state=closed]:-translate-y-full data-[side=bottom]:data-[state=closed]:translate-y-full data-[state=open]:animate-[slideInRight_0.35s_ease-out_forwards] data-[state=closed]:animate-[slideOutRight_0.35s_ease-out_forwards]",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-3 right-3"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">{t("common.close")}</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

const SheetClose = SheetPrimitive.Close;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
};
