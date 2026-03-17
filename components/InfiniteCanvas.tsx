"use client";

import { useInfiniteCanvas } from "@/hooks/useInfiniteCanvas";

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
              <img
                src={undefined}
                alt=""
                width={1}
                height={1}
                loading="lazy"
                decoding="async"
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
