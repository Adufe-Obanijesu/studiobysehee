"use client";

import type { PropsWithChildren } from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { useImageCopyrightContext } from "@/hooks/useImageCopyrightContext";
import { cn } from "@/lib/utils";

type ImageCopyrightContextMenuProps = PropsWithChildren<{
  className?: string;
}>;

export function ImageCopyrightContextMenu({
  children,
  className,
}: ImageCopyrightContextMenuProps) {
  const { copyrightNotice } = useImageCopyrightContext();

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className={cn(
            "relative z-10009 max-w-xs rounded-md border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-md outline-none",
            className,
          )}
        >
          <ContextMenuPrimitive.Item
            disabled
            className="cursor-default whitespace-pre opacity-100"
          >
            {copyrightNotice}
          </ContextMenuPrimitive.Item>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}
