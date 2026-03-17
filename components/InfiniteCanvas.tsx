"use client";

import { useInfiniteCanvas } from "@/hooks/useInfiniteCanvas";

export default function InfiniteCanvas() {
  const { scopeRef, pool, getCellImage, setCellRef, onImageLoad } = useInfiniteCanvas();

  return (
    <section ref={scopeRef} className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        {pool.map((slotIndex) => {
          const image = getCellImage(slotIndex);
          if (!image) {
            return null;
          }

          return (
            <div
              key={`slot-${slotIndex}`}
              ref={setCellRef(slotIndex)}
              className="absolute left-0 top-0 overflow-hidden rounded-xl bg-muted/20"
            >
              <img
                src={image.src}
                alt={image.alt || "Studio by Sehee photo"}
                width={image.naturalWidth}
                height={image.naturalHeight}
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
