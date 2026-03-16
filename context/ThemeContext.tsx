"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Navbar from "@/components/Navbar";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

const STORAGE_KEY = "SBS_preferred_theme";
const CIRCLE_DURATION = 0.6;
const THEME_SWITCH_OFFSET = 0.15;

function getStoredTheme(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light") return false;
    if (stored === "dark") return true;
  } catch {
    // ignore
  }
  return false; // fallback/default: light
}

function setStoredTheme(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
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

const DEFAULT_IS_DARK = false; // fallback/default; must match on server and client to avoid hydration mismatch

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(DEFAULT_IS_DARK);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDark(getStoredTheme());
  }, []);

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
          setStoredTheme(nextIsDark);
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
      <main className={cn("bg-background min-h-screen", isDark && "dark")}>
        <div
          ref={circleRef}
          className="fixed left-1/2 top-1/2 z-0 h-4 w-4 scale-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-foreground"
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
