"use client";

import { useCustomCursor } from "@/hooks/useCustomCursor";
import { CURSOR_SIZE } from "@/data/cursor";

export default function CustomCursor() {
  const { circleRef } = useCustomCursor();

  return (
    <div
      ref={circleRef}
      className="pointer-events-none fixed left-0 top-0 rounded-full will-change-transform opacity-0 bg-foreground border border-foreground"
      style={{
        zIndex: 99999,
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
      }}
      aria-hidden
    />
  );
}
