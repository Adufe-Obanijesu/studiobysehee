"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getResponsiveGalleryConfig } from "@/components/Gallery/constants";
import type { GalleryImage } from "@/components/Gallery/types";

const INFINITE_SCROLL_EDGE_ITEMS = 8;

type Params = {
  images: GalleryImage[];
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
};

const getColumnCountFromWidth = (width: number) => {
  return getResponsiveGalleryConfig(width).columnCount;
};

export function useGalleryMasonry({
  images,
  hasMore,
  isFetchingMore,
  loadMore,
}: Params) {
  const [columnCount, setColumnCount] = useState(2);
  const [columnsReady, setColumnsReady] = useState(false);
  const [masonryScrollToIndex, setMasonryScrollToIndex] = useState<number | undefined>(
    undefined,
  );
  const loadingRequestedRef = useRef(false);

  useLayoutEffect(() => {
    const updateColumns = () => {
      setColumnCount(getColumnCountFromWidth(window.innerWidth));
    };

    updateColumns();
    setColumnsReady(true);
    window.addEventListener("resize", updateColumns);

    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const requestMore = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    if (loadingRequestedRef.current) return;

    loadingRequestedRef.current = true;
    loadMore();
  }, [hasMore, isFetchingMore, loadMore]);

  useEffect(() => {
    if (!isFetchingMore) {
      loadingRequestedRef.current = false;
    }
  }, [isFetchingMore, images.length]);

  const onMasonryRender = useCallback(
    (_startIndex: number, stopIndex: number) => {
      if (!hasMore || isFetchingMore) return;
      if (images.length === 0) return;
      if (stopIndex < images.length - INFINITE_SCROLL_EDGE_ITEMS) return;
      requestMore();
    },
    [hasMore, isFetchingMore, images.length, requestMore],
  );

  const scrollToIndex = useCallback((index: number) => {
    setMasonryScrollToIndex(undefined);
    requestAnimationFrame(() => {
      setMasonryScrollToIndex(index);
    });
  }, []);

  return {
    columnCount,
    columnsReady,
    requestMore,
    scrollToIndex,
    masonryScrollToIndex,
    onMasonryRender,
  };
}
