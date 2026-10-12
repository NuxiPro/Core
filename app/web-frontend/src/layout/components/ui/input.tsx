import type * as React from "react";

import { cn } from "@/src/shared/utils/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

export { Input };
