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
  const mobileLinksRef = useRef<HTMLUListElement | null>(null);
  const mobileSocialsRef = useRef<HTMLDivElement | null>(null);
  const mobileCtaRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuIconRef = useRef<HTMLSpanElement | null>(null);
  const closeIconRef = useRef<HTMLSpanElement | null>(null);
  const hasInitializedIconAnimationRef = useRef(false);

  useGSAP(
    () => {
      const circle = circleRef.current;
      const content = contentRef.current;
      const mobileLinksEl = mobileLinksRef.current;
      const mobileSocialsEl = mobileSocialsRef.current;
      const mobileCtaEl = mobileCtaRef.current;

      if (!circle || !content) return;

      gsap.set(circle, {
        transformOrigin: "center center",
        scale: 0,
      });

      gsap.set(content, {
        opacity: 0,
      });

      const mobileSocialItems = mobileSocialsEl
        ? gsap.utils.toArray<HTMLElement>(
            mobileSocialsEl.querySelectorAll("a")
          )
        : [];

      const mobileCtaItems = mobileCtaEl
        ? gsap.utils.toArray<HTMLElement>(
            mobileCtaEl.querySelectorAll("a, button")
          )
        : [];

      const mobileFadeTargets = [...mobileSocialItems, ...mobileCtaItems];

      if (mobileFadeTargets.length) {
        gsap.set(mobileFadeTargets, {
          opacity: 0,
        });
      }

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
        .to(
          circle,
          {
            scale: finalScale,
            duration: 1.2,
            ease: "power3.inOut",
          },
          "<"
        )
        .to(
          content,
          {
            opacity: 1,
            duration: 0.25,
          }
        )
        .to(
          ".mobile-nav-link",
          {
            scale: 1,
            duration: 0.4,
            // ease: EASE,
            ease: "back.out(1.7)",
            stagger: 0.05,
          },
          "-=0.15"
        )
        .to(
          mobileFadeTargets,
          {
            opacity: 1,
            duration: 0.35,
            ease: EASE,
            stagger: 0.04,
          },
          "-=0.15"
        );

      timelineRef.current = tl;

      return () => {
        tl.kill();
        closeTimelineRef.current?.kill();
        closeTimelineRef.current = null;
        timelineRef.current = null;
      };
    },
    { scope: overlayScopeRef }
  );

  useGSAP(
    () => {
      const tl = timelineRef.current;
      if (!tl) return;

      const circle = circleRef.current;
      const content = contentRef.current;
      if (!circle || !content) return;

      if (isMobileMenuOpen) {
        closeTimelineRef.current?.kill();
        closeTimelineRef.current = null;

        // Ensure content and items are visible before playing open timeline
        gsap.set([content, ".mobile-nav-link"], { opacity: 1 });

        gsap.set(overlayScopeRef.current, {
          pointerEvents: "auto",
        });
        tl.restart();
      } else {
        // Close: fade out all inner elements, then shrink the circle
        const mobileLinks = gsap.utils.toArray<HTMLElement>(".mobile-nav-link");

        const mobileSocialsEl = mobileSocialsRef.current;
        const mobileCtaEl = mobileCtaRef.current;

        const mobileSocialItems = mobileSocialsEl
          ? gsap.utils.toArray<HTMLElement>(
              mobileSocialsEl.querySelectorAll("a")
            )
          : [];

        const mobileCtaItems = mobileCtaEl
          ? gsap.utils.toArray<HTMLElement>(
              mobileCtaEl.querySelectorAll("a, button")
            )
          : [];

        const fadeTargets = [
          ...mobileLinks,
          ...mobileSocialItems,
          ...mobileCtaItems,
        ];

        tl.pause();
        closeTimelineRef.current?.kill();

        closeTimelineRef.current = gsap
          .timeline({
            defaults: { ease: EASE },
            onComplete: () => {
              gsap.set(overlayScopeRef.current, {
                pointerEvents: "none",
              });
              tl.pause(0);
            },
          })
          .to(
            content,
            {
              opacity: 0,
              duration: 0.4,
              stagger: fadeTargets.length ? 0 : 0,
            },
            0
          )
          .to(circle, {
            scale: 0,
            duration: 1.2,
            ease: "power3.inOut",
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
    mobileLinksRef,
    mobileSocialsRef,
    mobileCtaRef,
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
