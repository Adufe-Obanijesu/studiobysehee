"use client";

import { HiSun, HiMoon } from "react-icons/hi";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import type { UseThemeToggleProps } from "@/hooks/useThemeToggle";

export default function ThemeToggle(props: UseThemeToggleProps = {}) {
  const {
    containerRef,
    sunRef,
    moonRef,
    isDark,
    disabled,
    handleClick,
    ROTATION,
  } = useThemeToggle(props);

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="fixed top-10 right-10 z-50 rounded-full text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        ref={sunRef}
        className="absolute inline-flex items-center justify-center w-6 h-6"
        style={
          !isDark
            ? undefined
            : { opacity: 0, transform: `rotate(-${ROTATION}deg)` }
        }
        aria-hidden
      >
        <HiSun className="w-6 h-6 text-red-500 transition-colors duration-200 ease-in-out" />
      </span>
      <span
        ref={moonRef}
        className="absolute inline-flex items-center justify-center w-6 h-6"
        style={
          isDark
            ? undefined
            : { opacity: 0, transform: `rotate(-${ROTATION}deg)` }
        }
        aria-hidden
      >
        <HiMoon className="w-6 h-6 text-background transition-colors duration-200 ease-in-out" />
      </span>
    </button>
  );
}
