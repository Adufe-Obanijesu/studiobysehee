import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type PrimaryCtaButtonProps = ComponentPropsWithoutRef<"button"> & {
  fullLabel?: string;
  shortLabel?: string;
};

export function PrimaryCtaButton({
  className,
  fullLabel = "Book a session",
  shortLabel = "Book",
  type = "button",
  ...props
}: PrimaryCtaButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "block group relative overflow-hidden rounded-md bg-primary px-8 py-4 text-center font-medium text-background lg:px-4 lg:py-2 lg:text-left lg:text-sm",
        className
      )}
      {...props}
    >
      <span
        className="absolute left-1/2 top-1/2 z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-foreground transition-transform transition-ease-400 group-hover:scale-100"
        style={{ transformOrigin: "center center" }}
        aria-hidden
      />
      <span className="relative z-10 text-light transition-colors transition-ease-300 group-hover:text-background lg:hidden xl:inline-block">
        {fullLabel}
      </span>
      <span className="relative z-10 hidden text-light transition-colors transition-ease-300 group-hover:text-background lg:inline-block xl:hidden">
        {shortLabel}
      </span>
    </button>
  );
}
