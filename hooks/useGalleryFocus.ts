"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GalleryImage } from "@/components/Gallery/types";
import { GALLERY_LIGHTBOX_IMAGE_SIZES } from "@/components/Gallery/constants";

gsap.registerPlugin(useGSAP);

const SWIPE_THRESHOLD_PX = 50;
const PAGINATION_PREFETCH_DISTANCE = 5;

type Params = {
  images: GalleryImage[];
  getFigureElement: (imageId: number) => HTMLElement | null;
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
  scrollToIndex: (index: number) => void;
};

export function useGalleryFocus({
  images,
  getFigureElement,
  hasMore,
  isFetchingMore,
  loadMore,
  scrollToIndex,
}: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openCounter, setOpenCounter] = useState(0);
  const [isLightboxImageLoaded, setIsLightboxImageLoaded] = useState(false);

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const closeCursorRef = useRef<HTMLDivElement | null>(null);
  const captionMaskRef = useRef<HTMLDivElement | null>(null);
  const captionTextRef = useRef<HTMLParagraphElement | null>(null);
  const originRef = useRef({ cx: 0, cy: 0 });
  const openImageIndexRef = useRef<number | null>(null);
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pendingScrollIndexRef = useRef<number | null>(null);

  // Always-current refs to avoid stale closures in stable callbacks
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const scrollToIndexRef = useRef(scrollToIndex);
  scrollToIndexRef.current = scrollToIndex;
  const getFigureElementRef = useRef(getFigureElement);
  getFigureElementRef.current = getFigureElement;
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const openFromImageId = useCallback(
    (imageId: number) => {
      const index = images.findIndex((img) => img.id === imageId);
      if (index === -1) return;

      const el = getFigureElementRef.current(imageId);
      const rect = el?.getBoundingClientRect();
      originRef.current = rect
        ? { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
        : { cx: window.innerWidth / 2, cy: window.innerHeight / 2 };

      setActiveIndex(index);
      setIsLightboxImageLoaded(false);
      setIsOpen(true);
      setOpenCounter((c) => c + 1);
      openImageIndexRef.current = index;
    },
    [images],
  );

  const navigate = useCallback((direction: 1 | -1) => {
    const next = activeIndexRef.current + direction;
    if (next < 0 || next >= imagesRef.current.length) return;
    setActiveIndex(next);
    setIsLightboxImageLoaded(false);
  }, []);

  const navigatePrev = useCallback(() => navigate(-1), [navigate]);
  const navigateNext = useCallback(() => navigate(1), [navigate]);

  const close = useCallback(() => {
    pendingScrollIndexRef.current = activeIndexRef.current;
    const tl = openTimelineRef.current;
    if (tl) {
      tl.eventCallback("onReverseComplete", () => {
        setIsOpen(false);
        openTimelineRef.current = null;
        tl.eventCallback("onReverseComplete", null);
      });
      tl.reverse();
    } else {
      setIsOpen(false);
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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

  const onPointerCancel = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Scroll restoration — runs AFTER the overflow cleanup above, guaranteeing
  // the document is scrollable before window.scrollTo is called.
  useEffect(() => {
    if (isOpen || pendingScrollIndexRef.current === null) return;
    const index = pendingScrollIndexRef.current;
    pendingScrollIndexRef.current = null;
    scrollToIndexRef.current(index);
  }, [isOpen]);

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

  useGSAP(
    () => {
      if (!isOpen) return;

      const backdrop = backdropRef.current;
      const cursor = closeCursorRef.current;
      if (!backdrop || !cursor) return;

      gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

      const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3.out" });

      const onMouseMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const onMouseEnter = () => {
        gsap.to(cursor, { autoAlpha: 1, duration: 0.2, ease: "power2.out" });
      };
      const onMouseLeave = () => {
        gsap.to(cursor, { autoAlpha: 0, duration: 0.15, ease: "power2.in" });
      };

      backdrop.addEventListener("mousemove", onMouseMove);
      backdrop.addEventListener("mouseenter", onMouseEnter);
      backdrop.addEventListener("mouseleave", onMouseLeave);

      return () => {
        backdrop.removeEventListener("mousemove", onMouseMove);
        backdrop.removeEventListener("mouseenter", onMouseEnter);
        backdrop.removeEventListener("mouseleave", onMouseLeave);
        gsap.killTweensOf(cursor);
      };
    },
    { dependencies: [isOpen], revertOnUpdate: true },
  );

  const markLightboxImageLoaded = useCallback(() => {
    setIsLightboxImageLoaded(true);
  }, []);

  return {
    isOpen,
    activeIndex,
    activeImage,
    canNavigatePrev: activeIndex > 0,
    canNavigateNext: activeIndex < images.length - 1,
    isLightboxImageLoaded,
    lightboxSizes: GALLERY_LIGHTBOX_IMAGE_SIZES,
    markLightboxImageLoaded,
    backdropRef,
    contentWrapperRef,
    closeCursorRef,
    captionMaskRef,
    captionTextRef,
    openFromImageId,
    navigatePrev,
    navigateNext,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    close,
  };
}
