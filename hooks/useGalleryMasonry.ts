"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { VirtuosoHandle } from "react-virtuoso";
import { getResponsiveGalleryConfig } from "@/components/Gallery/constants";
import type { GalleryImage } from "@/components/Gallery/types";

type Params = {
  images: GalleryImage[];
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
};

const getAspectRatio = (image: GalleryImage) =>
  image.width > 0 ? image.height / image.width : 1;

export function useGalleryMasonry({ images, hasMore, isFetchingMore, loadMore }: Params) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const columnVirtuosoRefs = useRef<(VirtuosoHandle | null)[]>([]);
  const [columnCount, setColumnCount] = useState(2);

  useLayoutEffect(() => {
    const update = () => {
      setColumnCount(getResponsiveGalleryConfig(window.innerWidth).columnCount);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { columns, imagePositionMap } = useMemo(() => {
    const safe = Math.max(1, columnCount);
    const cols: GalleryImage[][] = Array.from({ length: safe }, () => []);
    const heights = Array.from({ length: safe }, () => 0);
    const posMap = new Map<number, { colIndex: number; rowIndex: number }>();

    images.forEach((image) => {
      const target = heights.reduce(
        (lo, h, i, arr) => (h < arr[lo] ? i : lo),
        0,
      );
      posMap.set(image.id, { colIndex: target, rowIndex: cols[target].length });
      cols[target].push(image);
      heights[target] += getAspectRatio(image);
    });

    return { columns: cols, imagePositionMap: posMap };
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
      { root: null, rootMargin: "400px 0px", threshold: 0.01 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMore]);

  const scrollToIndex = useCallback(
    (globalIndex: number) => {
      if (globalIndex < 0 || globalIndex >= images.length) return;
      const image = images[globalIndex];
      if (!image) return;
      const pos = imagePositionMap.get(image.id);
      if (!pos) return;
      const ref = columnVirtuosoRefs.current[pos.colIndex];
      if (!ref) return;
      ref.scrollToIndex({ index: pos.rowIndex, align: "center", behavior: "smooth" });
    },
    [images, imagePositionMap],
  );

  return {
    columns,
    columnCount,
    columnVirtuosoRefs,
    sentinelRef,
    scrollToIndex,
  };
}
