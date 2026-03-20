"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GalleryImage } from "@/components/Gallery/types";

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

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef({ cx: 0, cy: 0 });
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
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
      setIsOpen(true);
      setOpenCounter((c) => c + 1);
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

  const markLightboxImageLoaded = useCallback(() => {
    setIsLightboxImageLoaded(true);
  }, []);

  return {
    isOpen,
    activeIndex,
    activeImage,
    isLightboxImageLoaded,
    markLightboxImageLoaded,
    backdropRef,
    contentWrapperRef,
    openFromImageId,
    close,
  };
}
