"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GalleryImage } from "@/components/Gallery/types";
import { GALLERY_LIGHTBOX_IMAGE_SIZES } from "@/components/Gallery/constants";

gsap.registerPlugin(useGSAP);

const SWIPE_THRESHOLD_PX = 50;
const PAGINATION_PREFETCH_DISTANCE = 5;

const FIGURE_SETTLE_SCALE = 1.035;
const FIGURE_SETTLE_UP_DURATION = 0.32;
const FIGURE_SETTLE_DOWN_DURATION = 0.48;
const FIGURE_SETTLE_MAX_RAF_RETRIES = 8;
/** If grid `onLoad` never fires, still run settle so the user gets feedback. */
const FIGURE_SETTLE_LOAD_FALLBACK_MS = 3500;

function playGalleryFigureSettle(target: HTMLElement | null) {
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.killTweensOf(target);
  if (reduced) {
    gsap.set(target, { clearProps: "transform" });
    return;
  }
  gsap.set(target, { transformOrigin: "50% 50%", scale: 1 });
  gsap
    .timeline({
      onComplete: () => {
        gsap.set(target, { clearProps: "transform" });
      },
    })
    .to(target, {
      delay: .5,
      scale: FIGURE_SETTLE_SCALE,
      duration: FIGURE_SETTLE_UP_DURATION,
      ease: "power2.out",
    })
    .to(target, {
      scale: 1,
      duration: FIGURE_SETTLE_DOWN_DURATION,
      ease: "power3.out",
    });
}

function scheduleGalleryFigureSettle(getTarget: () => HTMLElement | null) {
  const run = (attempt: number) => {
    const el = getTarget();
    if (el) {
      playGalleryFigureSettle(el);
      return;
    }
    if (attempt < FIGURE_SETTLE_MAX_RAF_RETRIES) {
      requestAnimationFrame(() => run(attempt + 1));
    }
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => run(0));
  });
}

type Params = {
  images: GalleryImage[];
  getFigureElement: (imageId: number) => HTMLElement | null;
  /** Grid thumbnail load state; keep current via ref inside this hook. */
  isImageLoaded: (imageId: number) => boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
  scrollToIndex: (index: number) => void;
};

export function useGalleryFocus({
  images,
  getFigureElement,
  isImageLoaded,
  hasMore,
  isFetchingMore,
  loadMore,
  scrollToIndex,
}: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openCounter, setOpenCounter] = useState(0);
  const [isLightboxImageLoaded, setIsLightboxImageLoaded] = useState(false);
  const [isLightboxImageFailed, setIsLightboxImageFailed] = useState(false);

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const captionMaskRef = useRef<HTMLDivElement | null>(null);
  const captionTextRef = useRef<HTMLParagraphElement | null>(null);
  const originRef = useRef({ cx: 0, cy: 0 });
  const openImageIndexRef = useRef<number | null>(null);
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  /** Captured when lightbox opens; used to restore scroll before masonry scroll + close. */
  const bodyOverflowBeforeLightboxRef = useRef("");
  /** Defer figure settle until grid thumb `onLoad` when thumb was not yet loaded. */
  const pendingSettleImageIdRef = useRef<number | null>(null);
  const settleFallbackTimeoutRef = useRef<number | null>(null);

  // Always-current refs to avoid stale closures in stable callbacks
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const scrollToIndexRef = useRef(scrollToIndex);
  scrollToIndexRef.current = scrollToIndex;
  const getFigureElementRef = useRef(getFigureElement);
  getFigureElementRef.current = getFigureElement;
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const isImageLoadedRef = useRef(isImageLoaded);
  isImageLoadedRef.current = isImageLoaded;

  const clearFigureSettleFallback = useCallback(() => {
    const t = settleFallbackTimeoutRef.current;
    if (t != null) {
      clearTimeout(t);
      settleFallbackTimeoutRef.current = null;
    }
  }, []);

  const resetPendingFigureSettle = useCallback(() => {
    pendingSettleImageIdRef.current = null;
    clearFigureSettleFallback();
  }, [clearFigureSettleFallback]);

  const tryFigureSettleAfterClose = useCallback(
    (closedAtIndex: number) => {
      const id = imagesRef.current[closedAtIndex]?.id;
      if (id == null) return;

      clearFigureSettleFallback();
      pendingSettleImageIdRef.current = null;

      if (isImageLoadedRef.current(id)) {
        scheduleGalleryFigureSettle(() => getFigureElementRef.current(id));
        return;
      }

      pendingSettleImageIdRef.current = id;
      settleFallbackTimeoutRef.current = window.setTimeout(() => {
        settleFallbackTimeoutRef.current = null;
        if (pendingSettleImageIdRef.current !== id) return;
        pendingSettleImageIdRef.current = null;
        scheduleGalleryFigureSettle(() => getFigureElementRef.current(id));
      }, FIGURE_SETTLE_LOAD_FALLBACK_MS);
    },
    [clearFigureSettleFallback],
  );

  const notifyGridImageLoaded = useCallback(
    (imageId: number) => {
      if (pendingSettleImageIdRef.current !== imageId) return;
      pendingSettleImageIdRef.current = null;
      clearFigureSettleFallback();
      scheduleGalleryFigureSettle(() => getFigureElementRef.current(imageId));
    },
    [clearFigureSettleFallback],
  );

  const openFromImageId = useCallback(
    (imageId: number) => {
      const index = images.findIndex((img) => img.id === imageId);
      if (index === -1) return;

      resetPendingFigureSettle();

      const el = getFigureElementRef.current(imageId);
      const rect = el?.getBoundingClientRect();
      originRef.current = rect
        ? { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
        : { cx: window.innerWidth / 2, cy: window.innerHeight / 2 };

      setActiveIndex(index);
      setIsLightboxImageLoaded(false);
      setIsLightboxImageFailed(false);
      setIsOpen(true);
      setOpenCounter((c) => c + 1);
      openImageIndexRef.current = index;
    },
    [images, resetPendingFigureSettle],
  );

  const navigate = useCallback((direction: 1 | -1) => {
    const next = activeIndexRef.current + direction;
    if (next < 0 || next >= imagesRef.current.length) return;
    setActiveIndex(next);
    setIsLightboxImageLoaded(false);
    setIsLightboxImageFailed(false);
  }, []);

  const navigatePrev = useCallback(() => navigate(-1), [navigate]);
  const navigateNext = useCallback(() => navigate(1), [navigate]);

  const close = useCallback(() => {
    const index = activeIndexRef.current;
    document.body.style.overflow = bodyOverflowBeforeLightboxRef.current;

    const onClosed = () => {
      tryFigureSettleAfterClose(index);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToIndexRef.current(index);
        const tl = openTimelineRef.current;
        if (tl) {
          tl.eventCallback("onReverseComplete", () => {
            setIsOpen(false);
            openTimelineRef.current = null;
            tl.eventCallback("onReverseComplete", null);
            onClosed();
          });
          tl.reverse();
        } else {
          setIsOpen(false);
          onClosed();
        }
      });
    });
  }, [tryFigureSettleAfterClose]);

  const isLightboxControlTarget = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest("button,[data-lightbox-control='true']"));

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isLightboxControlTarget(e.target)) {
      pointerStartRef.current = null;
      return;
    }

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isLightboxControlTarget(e.target)) {
        pointerStartRef.current = null;
        return;
      }

      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      }
      const start = pointerStartRef.current;
      if (!start) return;
      pointerStartRef.current = null;

      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > SWIPE_THRESHOLD_PX && absX > absY) {
        navigate(deltaX < 0 ? 1 : -1);
        return;
      }

      // Close on backdrop tap only (minimal pointer movement)
      if (absX <= 10 && absY <= 10) {
        const backdrop = backdropRef.current;
        if (backdrop && (e.target === backdrop || backdrop.contains(e.target as Node))) {
          close();
        }
      }
    },
    [navigate, close],
  );

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
    pointerStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    bodyOverflowBeforeLightboxRef.current = prev;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflowBeforeLightboxRef.current;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearFigureSettleFallback();
      pendingSettleImageIdRef.current = null;
    };
  }, [clearFigureSettleFallback]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "ArrowRight") { e.preventDefault(); navigate(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); navigate(-1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close, navigate]);

  // Prefetch next page when approaching the end of loaded images during slideshow
  useEffect(() => {
    if (!isOpen || !hasMore || isFetchingMore) return;
    if (activeIndex >= images.length - PAGINATION_PREFETCH_DISTANCE) {
      loadMore();
    }
  }, [activeIndex, hasMore, images.length, isFetchingMore, isOpen, loadMore]);

  const activeImage =
    isOpen && activeIndex >= 0 && activeIndex < images.length
      ? images[activeIndex]
      : null;

  useGSAP(
    () => {
      if (openCounter === 0) return;

      const backdrop = backdropRef.current;
      const content = contentWrapperRef.current;
      const captionMask = captionMaskRef.current;
      const captionText = captionTextRef.current;
      if (!backdrop || !content || !captionMask || !captionText) return;

      gsap.killTweensOf([backdrop, content]);
      openTimelineRef.current?.kill();

      const { cx, cy } = originRef.current;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const d = reduced ? 0.01 : 1;

      gsap.set(backdrop, { opacity: 0 });
      gsap.set(content, { scale: 0.4, transformOrigin: `${cx}px ${cy}px` });
      gsap.set(captionMask, { autoAlpha: 0 });
      gsap.set(captionText, { yPercent: 110, autoAlpha: 0 });

      const tl = gsap.timeline();
      openTimelineRef.current = tl;

      tl.to(backdrop, { opacity: 1, duration: 0.4 * d, ease: "power2.out" }).to(
        content,
        { scale: 1, duration: 0.5 * d, ease: "power3.out" },
        "<",
      ).to(
        captionMask,
        { autoAlpha: 1, duration: 0.01 },
        ">-0.02",
      ).to(
        captionText,
        { yPercent: 0, autoAlpha: 1, duration: 0.32 * d, ease: "power3.out" },
        "<",
      );
    },
    { dependencies: [openCounter] },
  );

  useGSAP(
    () => {
      if (!isOpen) return;
      if (openImageIndexRef.current === activeIndex) return;

      const captionMask = captionMaskRef.current;
      const captionText = captionTextRef.current;
      if (!captionMask || !captionText) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const d = reduced ? 0.01 : 1;

      gsap.killTweensOf([captionMask, captionText]);
      gsap.set(captionMask, { autoAlpha: 1 });
      gsap.fromTo(
        captionText,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.28 * d, ease: "power3.out" },
      );
    },
    { dependencies: [activeIndex, isOpen], revertOnUpdate: true },
  );

  const markLightboxImageLoaded = useCallback(() => {
    setIsLightboxImageLoaded(true);
    setIsLightboxImageFailed(false);
  }, []);

  const markLightboxImageFailed = useCallback(() => {
    setIsLightboxImageLoaded(false);
    setIsLightboxImageFailed(true);
  }, []);

  return {
    isOpen,
    activeIndex,
    activeImage,
    canNavigatePrev: activeIndex > 0,
    canNavigateNext: activeIndex < images.length - 1,
    isLightboxImageLoaded,
    isLightboxImageFailed,
    lightboxSizes: GALLERY_LIGHTBOX_IMAGE_SIZES,
    markLightboxImageLoaded,
    markLightboxImageFailed,
    backdropRef,
    contentWrapperRef,
    captionMaskRef,
    captionTextRef,
    openFromImageId,
    navigatePrev,
    navigateNext,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    close,
    notifyGridImageLoaded,
  };
}
