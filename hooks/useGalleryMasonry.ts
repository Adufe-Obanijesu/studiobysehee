"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COLUMN_COUNT_DESKTOP,
  COLUMN_COUNT_MOBILE,
  COLUMN_COUNT_TABLET,
  DESKTOP_BREAKPOINT,
  TABLET_BREAKPOINT,
} from "@/components/Gallery/constants";
import type { GalleryImage } from "@/components/Gallery/types";

type Params = {
  images: GalleryImage[];
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
};

const getColumnCountFromWidth = (width: number) => {
  if (width >= DESKTOP_BREAKPOINT) return COLUMN_COUNT_DESKTOP;
  if (width >= TABLET_BREAKPOINT) return COLUMN_COUNT_TABLET;
  return COLUMN_COUNT_MOBILE;
};

const getAspectRatio = (image: GalleryImage) =>
  image.width > 0 ? image.height / image.width : 1;

export function useGalleryMasonry({
  images,
  hasMore,
  isFetchingMore,
  loadMore,
}: Params) {
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  return { containerRef, sentinelRef, columns, columnCount };
}
