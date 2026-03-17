"use client";

import Image from "next/image";
import { useInfiniteCanvas } from "@/hooks/useInfiniteCanvas";

const PLACEHOLDER_SRC = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

export default function InfiniteCanvas() {
  const { scopeRef, pool, slotImages, setCellRef } = useInfiniteCanvas();

  return (
    <section ref={scopeRef} className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        {pool.map((slotIndex) => {
          const image = slotImages[slotIndex];
          return (
            <div
              key={`slot-${slotIndex}`}
              ref={setCellRef(slotIndex)}
              className="absolute left-0 top-0 overflow-hidden rounded-xl bg-muted/20"
            >
              <Image
                src={image?.src ?? PLACEHOLDER_SRC}
                alt={image?.alt || "Studio by Sehee photo"}
                fill
                sizes="100vw"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
