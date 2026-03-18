"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/components/Gallery/types";

export function useGalleryImageLoading(images: GalleryImage[]) {
  const [loadedImageIds, setLoadedImageIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const visibleIds = new Set(images.map((image) => image.id));
    setLoadedImageIds((prev) => {
      let changed = false;
      const next = new Set<number>();

      prev.forEach((id) => {
        if (visibleIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });

      if (!changed && next.size === prev.size) {
        return prev;
      }

      return next;
    });
  }, [images]);

  const markImageLoaded = useCallback((id: number) => {
    setLoadedImageIds((prev) => {
      if (prev.has(id)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const isImageLoaded = useCallback(
    (id: number) => loadedImageIds.has(id),
    [loadedImageIds],
  );

  return {
    isImageLoaded,
    markImageLoaded,
  };
}
