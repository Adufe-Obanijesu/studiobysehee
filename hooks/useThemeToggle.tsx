"use client";

import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "@/context/ThemeContext";

const ROTATION = 360;
const DURATION = 0.3;

export type UseThemeToggleProps = {
  isDark?: boolean;
  onToggle?: () => void;
  onToggleStart?: () => void;
  disabled?: boolean;
};

export function useThemeToggle({
  isDark: controlledIsDark,
  onToggle,
  onToggleStart,
  disabled: disabledProp = false,
}: UseThemeToggleProps = {}) {
  const theme = useTheme();
  const [internalIsDark, setInternalIsDark] = useState(false);

  const isDark =
    theme !== null
      ? theme.isDark
      : controlledIsDark !== undefined
        ? controlledIsDark
        : internalIsDark;
  const onStart = theme !== null ? theme.startThemeTransition : onToggleStart;
  const disabled = theme !== null ? theme.isTransitioning : disabledProp;

  const isAnimatingRef = useRef(false);
  const containerRef = useRef<HTMLButtonElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const moonRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {}, { scope: containerRef });

  const handleClick = useCallback(() => {
    const sunEl = sunRef.current;
    const moonEl = moonRef.current;
    if (!sunEl || !moonEl || isAnimatingRef.current || disabled) return;

    if (onStart) onStart();

    isAnimatingRef.current = true;
    const showingSun = !isDark;

    const tl = gsap.timeline({
      onComplete: () => {
        if (!onStart) {
          (onToggle ?? (() => setInternalIsDark((prev) => !prev)))();
        }
        gsap.set(showingSun ? sunEl : moonEl, {
          rotation: -ROTATION,
          opacity: 0,
        });
        isAnimatingRef.current = false;
      },
    });

    if (showingSun) {
      tl.to(sunEl, {
        rotation: ROTATION,
        opacity: 0,
        duration: DURATION,
        ease: "power2.in",
        filter: "blur(10px)",
      }).fromTo(
        moonEl,
        { rotation: -ROTATION, opacity: 0 },
        {
          rotation: 0,
          opacity: 1,
          duration: DURATION,
          ease: "power2.out",
          filter: "none",
        },
        "<+50%"
      );
    } else {
      tl.to(moonEl, {
        rotation: ROTATION,
        opacity: 0,
        duration: DURATION,
        ease: "power2.in",
        filter: "blur(10px)",
      }).fromTo(
        sunEl,
        { rotation: -ROTATION, opacity: 0 },
        {
          rotation: 0,
          opacity: 1,
          duration: DURATION,
          ease: "power2.out",
          filter: "none",
        },
        "<+50%"
      );
    }
  }, [disabled, isDark, onToggle, onStart]);

  return {
    containerRef,
    sunRef,
    moonRef,
    isDark,
    disabled,
    handleClick,
    ROTATION,
  };
}
