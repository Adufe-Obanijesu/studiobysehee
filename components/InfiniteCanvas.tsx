"use client";

import Image from "next/image";
import { useInfiniteCanvas } from "@/hooks/useInfiniteCanvas";

const PLACEHOLDER_SRC = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

export default function InfiniteCanvas() {
  const { scopeRef, pool, setCellRef, onImageLoad } = useInfiniteCanvas();

  return (
    <section ref={scopeRef} className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        {pool.map((slotIndex) => {
          return (
            <div
              key={`slot-${slotIndex}`}
              ref={setCellRef(slotIndex)}
              className="absolute left-0 top-0 overflow-hidden rounded-xl bg-muted/20"
            >
              <Image
                src={PLACEHOLDER_SRC}
                alt=""
                fill
                sizes="100vw"
                loading="lazy"
                onLoad={onImageLoad}
                className="h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
