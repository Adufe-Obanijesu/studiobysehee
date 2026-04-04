"use client";

import { PrimaryCtaButton } from "@/components/PrimaryCtaButton";
import { useBookSessionButton } from "@/hooks/useBookSessionButton";
import type { ComponentPropsWithoutRef } from "react";

type PrimaryCtaButtonProps = ComponentPropsWithoutRef<typeof PrimaryCtaButton>;

export function BookSessionButton({
  onAfterOpen,
  className,
  ...rest
}: {
  onAfterOpen?: () => void;
} & Omit<PrimaryCtaButtonProps, "onClick">) {
  const { handleClick } = useBookSessionButton(onAfterOpen);

  return (
    <PrimaryCtaButton
      {...rest}
      onClick={handleClick}
      className={className}
    />
  );
}
