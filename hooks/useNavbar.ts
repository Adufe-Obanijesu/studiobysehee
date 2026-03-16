"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/data/navbar";

const DURATION = 0.5;
const EASE = "power3.inOut";
const ICON_ROTATION = 360;
const ICON_DURATION = 0.3;

export function useNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const overlayScopeRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuIconRef = useRef<HTMLSpanElement | null>(null);
  const closeIconRef = useRef<HTMLSpanElement | null>(null);
  const hasInitializedIconAnimationRef = useRef(false);

  useGSAP(
    () => {
      const circle = circleRef.current;
      const content = contentRef.current;

      if (!circle || !content) return;

      gsap.set(circle, {
        transformOrigin: "cennter center",
        scale: 0,
      });

      gsap.set(content, {
        opacity: 0,
        y: 24,
      });

      const maxSize = Math.max(window.innerWidth, window.innerHeight);
      const finalScale = (maxSize / 16) * 2.5;

      gsap.set(overlayScopeRef.current, {
        autoAlpha: 1,
      })

      const tl = gsap
        .timeline({
          paused: true,
          defaults: { duration: DURATION, ease: EASE },
        })
        .to(circle, {
          scale: finalScale,
          duration: 1.2,
          ease: "power3.inOut",
        }, "<")
        .to(
          content,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          }
        );

      timelineRef.current = tl;

      return () => {
        tl.kill();
        timelineRef.current = null;
      };
    },
    { scope: overlayScopeRef }
  );

  useGSAP(
    () => {
      const tl = timelineRef.current;
      if (!tl) return;

      if (isMobileMenuOpen) {
        gsap.set(overlayScopeRef.current, {
          pointerEvents: "auto",
        });
        tl.play();
      } else {
        tl.reverse().eventCallback("onReverseComplete", () => {
          gsap.set(overlayScopeRef.current, {
            pointerEvents: "none",
          });
        });
      }
    },
    { dependencies: [isMobileMenuOpen] }
  );

  useGSAP(
    () => {
      const menuEl = menuIconRef.current;
      const closeEl = closeIconRef.current;

      if (!menuEl || !closeEl) return;
      gsap.set(mobileButtonRef.current, {
        autoAlpha: 1,
      });

      gsap.set(menuEl, {
        rotation: 0,
        opacity: 1,
        filter: "blur(0px)",
      });

      gsap.set(closeEl, {
        rotation: 0,
        opacity: 0,
        filter: "blur(0px)",
      });
    },
    { scope: mobileButtonRef }
  );

  useGSAP(
    () => {
      const menuEl = menuIconRef.current;
      const closeEl = closeIconRef.current;

      if (!menuEl || !closeEl) return;

      if (!hasInitializedIconAnimationRef.current) {
        hasInitializedIconAnimationRef.current = true;
        return;
      }

      gsap.killTweensOf([menuEl, closeEl]);

      const outgoingEl = isMobileMenuOpen ? menuEl : closeEl;
      const incomingEl = isMobileMenuOpen ? closeEl : menuEl;

      gsap.set(incomingEl, {
        filter: "blur(10px)",
      });

      gsap.timeline().to(outgoingEl, {
        rotation: `+=${ICON_ROTATION}`,
        opacity: 0,
        duration: ICON_DURATION,
        ease: "power2.in",
        filter: "blur(10px)",
      }).to(
        incomingEl,
        {
          rotation: `+=${ICON_ROTATION}`,
          opacity: 1,
          duration: ICON_DURATION,
          ease: "power2.out",
          filter: "blur(0px)",
        },
        "<+50%"
      );
    },
    { dependencies: [isMobileMenuOpen] }
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileToggleClick = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return {
    navLinks: NAV_LINKS,
    socialLinks: SOCIAL_LINKS,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    overlayScopeRef,
    circleRef,
    contentRef,
    mobileButtonRef,
    menuIconRef,
    closeIconRef,
    handleMobileToggleClick,
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
