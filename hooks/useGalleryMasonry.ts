"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getResponsiveGalleryConfig,
} from "@/components/Gallery/constants";
import type { GalleryImage } from "@/components/Gallery/types";

type Params = {
  images: GalleryImage[];
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
};

const getColumnCountFromWidth = (width: number) => {
  return getResponsiveGalleryConfig(width).columnCount;
};

const getAspectRatio = (image: GalleryImage) =>
  image.width > 0 ? image.height / image.width : 1;

export function useGalleryMasonry({
  images,
  hasMore,
  isFetchingMore,
  loadMore,
}: Params) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [columnCount, setColumnCount] = useState(2);

  useEffect(() => {
    const updateColumns = () => {
      setColumnCount(getColumnCountFromWidth(window.innerWidth));
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);

    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const columns = useMemo(() => {
    const safeColumnCount = Math.max(1, columnCount);
    const nextColumns: GalleryImage[][] = Array.from(
      { length: safeColumnCount },
      () => [],
    );
    const columnHeights = Array.from({ length: safeColumnCount }, () => 0);

    images.forEach((image) => {
      const targetColumn = columnHeights.reduce(
        (lowestIndex, currentHeight, index, heights) =>
          currentHeight < heights[lowestIndex] ? index : lowestIndex,
        0,
      );
      nextColumns[targetColumn].push(image);
      columnHeights[targetColumn] += getAspectRatio(image);
    });

    return nextColumns;
  }, [columnCount, images]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (!hasMore || isFetchingMore) return;
        loadMore();
      },
      {
        root: null,
        rootMargin: "400px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMore]);

  return { sentinelRef, columns, columnCount };
}
