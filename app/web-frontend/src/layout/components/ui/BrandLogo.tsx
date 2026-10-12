import { cn } from "@/src/shared/utils/utils";

type Props = {
  className?: string;
  alt?: string;
};

export function BrandLogo({ className, alt = "NuxiPro" }: Props) {
  return (
    <div className={cn("flex justify-center", className)}>
      <img
        src="/icon.svg"
        alt={alt}
        width={40}
        height={40}
        className="size-10 rounded-xl object-cover"
      />
    </div>
  );
}
