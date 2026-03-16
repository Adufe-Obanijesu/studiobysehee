"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Navbar from "@/components/Navbar";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const COOKIE_NAME = "SBS_preferred_theme";
const CIRCLE_DURATION = 0.6;
const THEME_SWITCH_OFFSET = 0.15;

function setThemeCookie(isDark: boolean): void {
  try {
    document.cookie = `${COOKIE_NAME}=${isDark ? "dark" : "light"}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore
  }
}

type ThemeContextValue = {
  isDark: boolean;
  isTransitioning: boolean;
  startThemeTransition: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export function ThemeProvider({
  children,
  initialIsDark = false,
}: {
  children: ReactNode;
  initialIsDark?: boolean;
}) {
  const [isDark, setIsDark] = useState(initialIsDark);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {}, { scope: circleRef });

  const startThemeTransition = useCallback(() => {
    const el = circleRef.current;
    if (!el || isTransitioning) return;

    const nextIsDark = !isDark;
    setIsTransitioning(true);
    gsap.killTweensOf(el);

    gsap.set(el, {
      scale: 1,
      backgroundColor: nextIsDark
        ? "oklch(0.135 0.004 83)"
        : "oklch(0.966 0.006 83)",
    });

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { scale: 0 });
          setIsTransitioning(false);
        },
      })
      .to(el, {
        scale: (Math.max(window.innerWidth, window.innerHeight) / 16) * 2.5,
        duration: CIRCLE_DURATION,
        ease: "power2.in",
        transformOrigin: "center center",
      })
      .add(
        () => {
          setIsDark(nextIsDark);
          setThemeCookie(nextIsDark);
          if (nextIsDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        },
        CIRCLE_DURATION - THEME_SWITCH_OFFSET
      );
  }, [isDark, isTransitioning]);

  const value: ThemeContextValue = {
    isDark,
    isTransitioning,
    startThemeTransition,
  };

  return (
    <ThemeContext.Provider value={value}>
      <main className="bg-background min-h-screen">
        <div
          ref={circleRef}
          className="fixed z-0 left-1/2 top-1/2 h-4 w-4 scale-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-foreground"
          style={{ transformOrigin: "center center" }}
          aria-hidden
        />
        <main className="relative z-10">
          <Navbar />
          {children}
        </main>
      </main>
    </ThemeContext.Provider>
  );
}
