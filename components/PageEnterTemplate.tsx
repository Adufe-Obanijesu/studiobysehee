"use client";

import type { ReactNode } from "react";
import { usePageEnterTemplate } from "@/hooks/usePageEnterTemplate";

export default function PageEnterTemplate({
  children,
}: {
  children: ReactNode;
}) {
  const { containerRef } = usePageEnterTemplate();

  return (
    <div ref={containerRef} className="w-full min-h-0">
      {children}
    </div>
  );
}
