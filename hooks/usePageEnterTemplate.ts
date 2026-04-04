"use client";

import { useRef, useMemo } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePreloaderContext } from "@/context/PreloaderContext";

const ENTER_DURATION = 0.5;
const ENTER_EASE = "sine.out";
/** Tailwind `lg` — page enter runs at this width and above only. */
const PAGE_ENTER_MIN_WIDTH_PX = 1024;

export function usePageEnterTemplate() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sawPreloaderIncomplete = useRef(false);

  const uiGate = usePreloaderContext();
  const preloaderComplete = uiGate?.preloaderComplete ?? true;
  const mobileNavAllowsPageAnimations =
    uiGate?.mobileNavAllowsPageAnimations ?? true;
  const canRunPageIntro = useMemo(
    () => preloaderComplete && mobileNavAllowsPageAnimations,
    [preloaderComplete, mobileNavAllowsPageAnimations]
  );

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const mq = window.matchMedia(
        `(min-width: ${PAGE_ENTER_MIN_WIDTH_PX}px)`
      );

      const setNeutral = () => {
        gsap.killTweensOf(el);
        gsap.set(el, { scale: 1, autoAlpha: 1, transformOrigin: "top" });
      };

      let activeTween: gsap.core.Tween | null = null;

      if (!preloaderComplete) {
        sawPreloaderIncomplete.current = true;
        setNeutral();
      } else if (sawPreloaderIncomplete.current) {
        sawPreloaderIncomplete.current = false;
        setNeutral();
      } else if (!canRunPageIntro) {
        setNeutral();
      } else if (!mq.matches) {
        setNeutral();
      } else {
        activeTween = gsap.fromTo(
          el,
          {
            scale: 0.95,
            autoAlpha: 0,
            transformOrigin: "top",
          },
          {
            scale: 1,
            autoAlpha: 1,
            duration: ENTER_DURATION,
            ease: ENTER_EASE,
          }
        );
      }

      const onViewportChange = () => {
        if (!mq.matches) {
          activeTween?.kill();
          activeTween = null;
          setNeutral();
        }
      };

      mq.addEventListener("change", onViewportChange);

      return () => {
        mq.removeEventListener("change", onViewportChange);
        activeTween?.kill();
        gsap.killTweensOf(el);
      };
    },
    { dependencies: [preloaderComplete, canRunPageIntro] }
  );

  return { containerRef };
}
