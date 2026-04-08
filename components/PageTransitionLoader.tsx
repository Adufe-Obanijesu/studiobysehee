"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { usePageTransition } from "@/context/PageTransitionContext";
import { cn } from "@/lib/utils";

export function PageTransitionLoader() {
  const { isNavigating, finishNavigation } = usePageTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Whenever the pathname or search params change, routing is complete
  useEffect(() => {
    finishNavigation();
  }, [pathname, searchParams, finishNavigation]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (isNavigating) {
      // Small delay to skip instant loads
      timeoutId = setTimeout(() => {
        setIsVisible(true);

        // Setup the initial state for the container and circle
        if (containerRef.current) {
          gsap.killTweensOf(containerRef.current);
          gsap.set(containerRef.current, { autoAlpha: 1 });
        }

        if (circleRef.current) {
          gsap.killTweensOf(circleRef.current);
          gsap.set(circleRef.current, { scale: 0.8, opacity: 1 });

          // Animate pulse
          tweenRef.current = gsap.to(circleRef.current, {
            scale: 1.5,
            opacity: 0.2,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
          });
        }
      }, 50); // 50ms delay
    } else {
      if (timeoutId) clearTimeout(timeoutId);

      // If we were showing the loader and navigation finished
      if (isVisible) {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
              setIsVisible(false);
              if (tweenRef.current) tweenRef.current.kill();
            }
          });
          // gsap.to(circleRef.current, {scale: 100, transformOrigin: "center center", duration: 2})
        } else {
          setIsVisible(false);
          if (tweenRef.current) tweenRef.current.kill();
        }
      }
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isNavigating, isVisible]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none fixed bottom-8 right-8 z-9999 flex items-center justify-center origin-center",
        !isVisible && "hidden"
      )}
    >
      <div
        ref={circleRef}
        className="w-8 h-8 lg:w-10 lg:h-10 bg-foreground rounded-full mix-blend-difference"
      />
    </div>
  );
}
