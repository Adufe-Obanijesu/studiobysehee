"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getResponsiveGalleryConfig } from "@/components/Gallery/constants";
import type { GalleryImage } from "@/components/Gallery/types";

export function useGalleryVirtualization(images: GalleryImage[]) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [containerTop, setContainerTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const startsRef = useRef<number[]>([]);

  useEffect(() => {
    let rafId = 0;

    const updateMetrics = () => {
      const { innerWidth, innerHeight, scrollY: currentScrollY } = window;
      const containerRect = containerRef.current?.getBoundingClientRect();
      const nextContainerTop = containerRect
        ? currentScrollY + containerRect.top
        : 0;
      const nextContainerWidth = containerRect?.width ?? innerWidth;

      setViewportWidth((prev) => (prev === innerWidth ? prev : innerWidth));
      setViewportHeight((prev) =>
        prev === innerHeight ? prev : innerHeight,
      );
      setScrollY((prev) => (prev === currentScrollY ? prev : currentScrollY));
      setContainerTop((prev) =>
        Math.abs(prev - nextContainerTop) < 1 ? prev : nextContainerTop,
      );
      setContainerWidth((prev) =>
        Math.abs(prev - nextContainerWidth) < 1 ? prev : nextContainerWidth,
      );
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateMetrics();
      });
    };

    updateMetrics();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const virtualState = useMemo(() => {
    if (images.length === 0) {
      return {
        visibleImages: images,
        maxRenderedImages: getResponsiveGalleryConfig(viewportWidth)
          .maxRenderedImages,
        hiddenImageCount: 0,
        topSpacerHeight: 0,
        bottomSpacerHeight: 0,
      };
    }

    const { columnCount, maxRenderedImages } =
      getResponsiveGalleryConfig(viewportWidth);
    const gapPx = 16;
    const safeColumnCount = Math.max(1, columnCount);
    const effectiveContainerWidth = Math.max(
      320,
      containerWidth || viewportWidth || 320,
    );
    const columnWidth =
      (effectiveContainerWidth - gapPx * (safeColumnCount - 1)) /
      safeColumnCount;

    const columnHeights = Array.from({ length: safeColumnCount }, () => 0);
    const starts = new Array<number>(images.length);
    const ends = new Array<number>(images.length);

    images.forEach((image, index) => {
      const imageRatio = image.width > 0 ? image.height / image.width : 1;
      const imageHeight = Math.max(1, imageRatio * columnWidth);
      const targetColumn = columnHeights.reduce(
        (lowestIndex, currentHeight, currentIndex, heights) =>
          currentHeight < heights[lowestIndex] ? currentIndex : lowestIndex,
        0,
      );
      const top = columnHeights[targetColumn];
      const bottom = top + imageHeight;

      starts[index] = top;
      ends[index] = bottom;
      columnHeights[targetColumn] = bottom + gapPx;
    });

    const totalHeight = Math.max(0, ...columnHeights) - gapPx;
    const overscanPx = Math.max(600, viewportHeight * 1.5);
    const windowStart = Math.max(0, scrollY - containerTop - overscanPx);
    const windowEnd = Math.max(
      0,
      scrollY - containerTop + viewportHeight + overscanPx,
    );

    let firstVisibleIndex = -1;
    let lastVisibleIndex = -1;

    for (let index = 0; index < images.length; index += 1) {
      const intersects =
        ends[index] >= windowStart && starts[index] <= windowEnd;
      if (!intersects) continue;
      if (firstVisibleIndex === -1) {
        firstVisibleIndex = index;
      }
      lastVisibleIndex = index;
    }

    if (firstVisibleIndex === -1 || lastVisibleIndex === -1) {
      firstVisibleIndex = 0;
      lastVisibleIndex = Math.min(images.length - 1, maxRenderedImages - 1);
    }

    const visibleSpan = lastVisibleIndex - firstVisibleIndex + 1;
    let startIndex = firstVisibleIndex;
    let endIndex = lastVisibleIndex;

    if (visibleSpan > maxRenderedImages) {
      const centerIndex = Math.floor((firstVisibleIndex + lastVisibleIndex) / 2);
      const halfWindow = Math.floor(maxRenderedImages / 2);
      startIndex = Math.max(0, centerIndex - halfWindow);
      endIndex = Math.min(images.length - 1, startIndex + maxRenderedImages - 1);
      startIndex = Math.max(0, endIndex - maxRenderedImages + 1);
    } else if (visibleSpan < maxRenderedImages) {
      const missing = maxRenderedImages - visibleSpan;
      const extendBefore = Math.floor(missing / 2);
      const extendAfter = missing - extendBefore;

      startIndex = Math.max(0, firstVisibleIndex - extendBefore);
      endIndex = Math.min(images.length - 1, lastVisibleIndex + extendAfter);

      const currentCount = endIndex - startIndex + 1;
      if (currentCount < maxRenderedImages) {
        const remaining = maxRenderedImages - currentCount;
        if (startIndex === 0) {
          endIndex = Math.min(images.length - 1, endIndex + remaining);
        } else if (endIndex === images.length - 1) {
          startIndex = Math.max(0, startIndex - remaining);
        }
      }
    }

    startsRef.current = starts;

    const visibleImages = images.slice(startIndex, endIndex + 1);
    const topSpacerHeight = starts[startIndex] ?? 0;
    const bottomSpacerHeight = Math.max(0, totalHeight - (ends[endIndex] ?? 0));

    return {
      visibleImages,
      maxRenderedImages,
      hiddenImageCount: Math.max(0, images.length - visibleImages.length),
      topSpacerHeight,
      bottomSpacerHeight,
    };
  }, [
    containerTop,
    containerWidth,
    images,
    scrollY,
    viewportHeight,
    viewportWidth,
  ]);

  const scrollToIndex = useCallback((index: number) => {
    const top = startsRef.current[index];
    const container = containerRef.current;
    if (top === undefined || !container) return;
    const containerTop = window.scrollY + container.getBoundingClientRect().top;
    const SCROLL_OFFSET_PX = 200;
    window.scrollTo({
      top: Math.max(0, containerTop + top - SCROLL_OFFSET_PX),
      behavior: "smooth",
    });
  }, []);

  return {
    containerRef,
    scrollToIndex,
    ...virtualState,
  };
}
