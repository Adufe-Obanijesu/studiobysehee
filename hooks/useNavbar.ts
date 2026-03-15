"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { NAV_LINKS, SOCIAL_LINKS } from "@/data/navbar";

gsap.registerPlugin(SplitText);

const DURATION = 0.35;
const EASE = "power2.inOut";
const STAGGER = 0.02;

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

      const split1 = new SplitText(el1, { type: "chars", mask: "chars" });
      const split2 = new SplitText(el2, { type: "chars", mask: "chars" });
      const chars1 = split1.chars;
      const chars2 = split2.chars;

      gsap.set(chars2, { yPercent: 100 });

      const tl = gsap
        .timeline({ paused: true })
        .to(chars1, {
          yPercent: -100,
          duration: DURATION,
          stagger: STAGGER,
          ease: EASE,
        })
        .to(
          chars2,
          {
            yPercent: 0,
            duration: DURATION,
            stagger: STAGGER,
            ease: EASE,
          },
          "<"
        );
      timelineRef.current = tl;

      return () => {
        tl.kill();
        timelineRef.current = null;
        split1.revert();
        split2.revert();
      };
    },
    { scope: wrapperRef }
  );

  const onMouseEnter = useCallback(() => {
    timelineRef.current?.play();
  }, []);

  const onMouseLeave = useCallback(() => {
    timelineRef.current?.reverse();
  }, []);

  return { wrapperRef, line1Ref, line2Ref, onMouseEnter, onMouseLeave };
}
