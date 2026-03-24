"use client";

import { useCallback, useState } from "react";

export function useGalleryGridItem() {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return {
    isLoaded,
    handleImageLoad,
  };
}
