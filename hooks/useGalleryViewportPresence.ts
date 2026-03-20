"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

const DATA_ATTR = "data-gallery-image-id";

/**
 * Tracks which gallery image ids currently intersect the browser viewport.
 * One IntersectionObserver; observe/unobserve as virtualized figures mount and unmount.
 */
export function useGalleryViewportPresence() {
  const intersectingIdsRef = useRef<Set<number>>(new Set());
  const elementByIdRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const refCallbackCacheRef = useRef<Map<number, (el: HTMLElement | null) => void>>(
    new Map(),
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const raw = entry.target.getAttribute(DATA_ATTR);
          const id = raw ? Number(raw) : NaN;
          if (!Number.isFinite(id)) continue;
          if (entry.isIntersecting) {
            intersectingIdsRef.current.add(id);
          } else {
            intersectingIdsRef.current.delete(id);
          }
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      },
    );

    observerRef.current = observer;
    elementByIdRef.current.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
      intersectingIdsRef.current.clear();
      elementByIdRef.current.clear();
    };
  }, []);

  const registerFigure = useCallback((imageId: number, el: HTMLElement | null) => {
    const observer = observerRef.current;
    const prev = elementByIdRef.current.get(imageId);

    if (prev) {
      if (observer) observer.unobserve(prev);
      intersectingIdsRef.current.delete(imageId);
      elementByIdRef.current.delete(imageId);
    }

    if (el) {
      el.setAttribute(DATA_ATTR, String(imageId));
      elementByIdRef.current.set(imageId, el);
      if (observer) observer.observe(el);
    }
  }, []);

  const registerFigureRef = useCallback(
    (imageId: number) => {
      let cached = refCallbackCacheRef.current.get(imageId);
      if (!cached) {
        cached = (el: HTMLElement | null) => {
          registerFigure(imageId, el);
        };
        refCallbackCacheRef.current.set(imageId, cached);
      }
      return cached;
    },
    [registerFigure],
  );

  const getIntersectingImageIds = useCallback(() => {
    return new Set(intersectingIdsRef.current);
  }, []);

  const getFigureElement = useCallback((imageId: number) => {
    return elementByIdRef.current.get(imageId) ?? null;
  }, []);

  return {
    registerFigureRef,
    getIntersectingImageIds,
    getFigureElement,
  };
}
