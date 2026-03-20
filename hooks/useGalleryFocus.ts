"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GalleryImage } from "@/components/Gallery/types";
import {
  GALLERY_GRID_IMAGE_SIZES,
  GALLERY_LIGHTBOX_IMAGE_SIZES,
} from "@/components/Gallery/constants";

gsap.registerPlugin(useGSAP);

type Params = {
  images: GalleryImage[];
  getFigureElement: (imageId: number) => HTMLElement | null;
};

export function useGalleryFocus({ images, getFigureElement }: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openCounter, setOpenCounter] = useState(0);
  const [isLightboxImageLoaded, setIsLightboxImageLoaded] = useState(false);
  const [lightboxSizes, setLightboxSizes] = useState(GALLERY_GRID_IMAGE_SIZES);

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const closeCursorRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef({ cx: 0, cy: 0 });
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const upgradeRafRef = useRef<number | null>(null);
  const getFigureElementRef = useRef(getFigureElement);
  getFigureElementRef.current = getFigureElement;

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
      setLightboxSizes(GALLERY_GRID_IMAGE_SIZES);
      setIsOpen(true);
      setOpenCounter((c) => c + 1);

      if (upgradeRafRef.current !== null) {
        cancelAnimationFrame(upgradeRafRef.current);
      }
      upgradeRafRef.current = requestAnimationFrame(() => {
        upgradeRafRef.current = null;
        setLightboxSizes(GALLERY_LIGHTBOX_IMAGE_SIZES);
      });
    },
    [images],
  );

  const close = useCallback(() => {
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

  useEffect(() => {
    return () => {
      if (upgradeRafRef.current !== null) {
        cancelAnimationFrame(upgradeRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const activeImage =
    isOpen && activeIndex >= 0 && activeIndex < images.length
      ? images[activeIndex]
      : null;

  useGSAP(
    () => {
      if (openCounter === 0) return;

      const backdrop = backdropRef.current;
      const content = contentWrapperRef.current;
      if (!backdrop || !content) return;

      gsap.killTweensOf([backdrop, content]);
      openTimelineRef.current?.kill();

      const { cx, cy } = originRef.current;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const d = reduced ? 0.01 : 1;

      gsap.set(backdrop, { opacity: 0 });
      gsap.set(content, { scale: 0.4, transformOrigin: `${cx}px ${cy}px` });

      const tl = gsap.timeline();
      openTimelineRef.current = tl;

      tl.to(backdrop, { opacity: 1, duration: 0.4 * d, ease: "power2.out" }).to(
        content,
        { scale: 1, duration: 0.5 * d, ease: "power3.out" },
        "<",
      );
    },
    { dependencies: [openCounter] },
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
    isLightboxImageLoaded,
    lightboxSizes,
    markLightboxImageLoaded,
    backdropRef,
    contentWrapperRef,
    closeCursorRef,
    openFromImageId,
    close,
  };
}
