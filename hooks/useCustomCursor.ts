"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  CURSOR_DURATION,
  CURSOR_EASE,
  CURSOR_SCALE_HOVER,
  CURSOR_FADE_DURATION,
  CURSOR_SCALE_DURATION,
  CURSOR_OPACITY,
} from "@/data/cursor";

const HOVER_SELECTOR = "a, button";

export function useCustomCursor() {
  const circleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = circleRef.current;
    if (!el) return;

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0, scale: 1 });

    const xTo = gsap.quickTo(el, "x", { duration: CURSOR_DURATION, ease: CURSOR_EASE });
    const yTo = gsap.quickTo(el, "y", { duration: CURSOR_DURATION, ease: CURSOR_EASE });

    let hasFadedIn = false;

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);

      if (!hasFadedIn) {
        hasFadedIn = true;
        gsap.to(el, { opacity: CURSOR_OPACITY, duration: CURSOR_FADE_DURATION, ease: CURSOR_EASE });
      }
    };
    
    const onMouseOver = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest(HOVER_SELECTOR)) {
        gsap.to(el, { scale: CURSOR_SCALE_HOVER, duration: CURSOR_SCALE_DURATION, ease: CURSOR_EASE, overwrite: "auto", opacity: .4 });
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!(e.relatedTarget as Element | null)?.closest(HOVER_SELECTOR)) {
        gsap.to(el, { scale: 1, duration: CURSOR_SCALE_DURATION, ease: CURSOR_EASE, overwrite: "auto", opacity: 1 });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      gsap.killTweensOf(el);
    };
  });

  return { circleRef };
}
