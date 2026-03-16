"use client";

// TODO: Ensure assets are loaded before the preloader starts

import "@/lib/gsap-effects";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { GSDevTools } from "gsap/GSDevTools";

gsap.registerPlugin(SplitText, GSDevTools);

const STAGGER_AMOUNT = 0.1;
const COLS = 5;

function createGridIntroSegment(items: HTMLElement[]): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.to(items, {
    autoAlpha: 1,
    scale: 1,
    yPercent: 0,
    duration: 0.4,
    ease: "back.out(1.7)",
    delay: (i) => Math.floor(i / COLS) * STAGGER_AMOUNT,
  });
  return tl;
}

function createGridExitAndIntroSwitchSegment(
  items: HTMLElement[]
): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.set(items, { transformOrigin: "top" })
    .to(items, {
      scale: 0.5,
      yPercent: -25,
      duration: 0.4,
      ease: "back.in",
      delay: (i) => Math.floor(i / COLS) * STAGGER_AMOUNT,
    })
    .to(
      items,
      {
        autoAlpha: 0,
        duration: 0.4,
        ease: "back.in",
        delay: (i) => Math.floor(i / COLS) * STAGGER_AMOUNT,
      },
      "<"
    )
    .set("#intro-1", { opacity: 0, pointerEvents: "none" })
    .to("#intro-2", { opacity: 1, duration: 0.4, ease: "back.in" }, "<");
  return tl;
}

function createTextRevealSegment(
  line1Chars: Element[],
  line2Chars: Element[]
): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.to(line1Chars, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out",
  }).to(
    line2Chars,
    {
      y: 0,
      opacity: 1,
      duration: 0.3,
      stagger: 0.04,
      ease: "power3.out",
    },
    "<50%"
  );
  return tl;
}

function createCircleSegment(circleEl: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.set(circleEl, { transformOrigin: "70% center" })
    .to(circleEl, { opacity: 1, ease: "sine.out" })
    .fromTo(
      circleEl,
      { scale: 0.5 },
      {
        scale: 1.2,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      },
      "<"
    )
    .to(circleEl, {
      scale: (Math.max(window.innerWidth, window.innerHeight) / 16) * 2.5,
      duration: 1.2,
      ease: "power3.inOut",
    });
  return tl;
}

export function usePreloader() {
  const circleRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    setAllLoaded(true);
  }, []);

  useGSAP(
    () => {
      if (!allLoaded || !gridRef.current) return;
      const items = Array.from(
        gridRef.current.querySelectorAll<HTMLElement>(".grid-item")
      );
      if (!items.length) return;
      const el1 = line1Ref.current;
      const el2 = line2Ref.current;
      if (!el1 || !el2) return;

      const split1 = new SplitText(el1, { type: "chars" });
      const split2 = new SplitText(el2, { type: "chars" });

      const line1Chars = split1.chars;
      const line2Chars = split2.chars;

      gsap.set(line2Chars, { y: 28, opacity: 0 });
      gsap.set(line1Chars, { opacity: 0 });
      gsap.set(items, {
        autoAlpha: 0,
        scale: 0.5,
        transformOrigin: "bottom",
        yPercent: 25,
      });

      const tl = gsap.timeline({ paused: false });
      tl.add(createGridIntroSegment(items));
      tl.add(createGridExitAndIntroSwitchSegment(items), "+=1");
      tl.add(createTextRevealSegment(line1Chars, line2Chars));
      if (circleRef.current) {
        tl.add(createCircleSegment(circleRef.current));
      }
      tl
      .to("#navbar", {autoAlpha: 1}, "<+75%")
      .set("#preloader", {display: "none"})

      return () => {
        split1.revert();
        split2.revert();
      };
    },
    { dependencies: [allLoaded] }
  );

  return { circleRef, line1Ref, line2Ref, gridRef };
}
