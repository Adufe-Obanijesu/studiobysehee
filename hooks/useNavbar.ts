"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/data/navbar";

const DURATION = 0.35;
const EASE = "power2.inOut";

export function useNavbar() {
  return {
    navLinks: NAV_LINKS,
    socialLinks: SOCIAL_LINKS,
  };
}

export function useNavLinkHover() {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const el1 = line1Ref.current;
      const el2 = line2Ref.current;
      if (!el1 || !el2) return;

      gsap.set(el1, {
        scale: 1,
        opacity: 1,
        yPercent: 0,
        transformOrigin: "50% 50%",
      });

      gsap.set(el2, {
        scale: 0.8,
        opacity: 0,
        yPercent: 0,
        transformOrigin: "50% 50%",
      });

      const tl = gsap
        .timeline({ paused: true })
        .to(el1, {
          scale: 1.5,
          opacity: 0,
          duration: DURATION,
          ease: EASE,
        })
        .to(
          el2,
          {
            scale: 1,
            opacity: 1,
            duration: DURATION,
            ease: EASE,
          },
          "<"
        );
      timelineRef.current = tl;

      return () => {
        tl.kill();
        timelineRef.current = null;
      };
    },
    { scope: wrapperRef }
  );

  const onMouseEnter = useCallback(() => {
    timelineRef.current?.restart();
  }, []);

  const onMouseLeave = useCallback(() => {
    const tl = timelineRef.current;
    const el1 = line1Ref.current;
    const el2 = line2Ref.current;

    tl?.pause(0);

    if (el1 && el2) {
      gsap.set(el1, { scale: 1, opacity: 1, yPercent: 0 });
      gsap.set(el2, { scale: 0.8, opacity: 0, yPercent: 0 });
    }
  }, []);

  return { wrapperRef, line1Ref, line2Ref, onMouseEnter, onMouseLeave };
}
