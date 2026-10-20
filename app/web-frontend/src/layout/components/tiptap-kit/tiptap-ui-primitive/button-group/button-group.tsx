import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Separator } from "@layout/components/tiptap-kit/tiptap-ui-primitive/separator";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/shared/lib/tiptap-utils";
import "./button-group.scss";

const buttonGroupVariants = cva("tiptap-button-group", {
  variants: {
    orientation: {
      horizontal: "tiptap-button-group-horizontal",
      vertical: "tiptap-button-group-vertical",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="tiptap-button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  buttonGroupVariants,
};
