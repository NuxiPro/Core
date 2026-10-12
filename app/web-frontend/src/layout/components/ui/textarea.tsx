import type * as React from "react";

import { cn } from "@/src/shared/utils/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

export { Textarea };
