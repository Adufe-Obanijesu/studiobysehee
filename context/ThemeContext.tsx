"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Footer from "@/components/Footer";
// import useLenis from "@/hooks/useLenis";

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

/** Ref to a node inside `<main>` (outside `#page-content`) so `position: fixed` overlays are not clipped by transformed ancestors. */
export const GalleryLightboxPortalContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export function ThemeProvider({
  children,
  initialIsDark = true,
}: {
  children: ReactNode;
  initialIsDark?: boolean;
}) {
  const [isDark, setIsDark] = useState(initialIsDark);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const galleryLightboxPortalRef = useRef<HTMLDivElement>(null);

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

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      isTransitioning,
      startThemeTransition,
    }),
    [isDark, isTransitioning, startThemeTransition],
  );

  // useLenis()

  return (
    <ThemeContext.Provider value={value}>
      <GalleryLightboxPortalContext.Provider value={galleryLightboxPortalRef}>
      <main className="bg-background min-h-screen overflow-y-hidden">
        <div ref={galleryLightboxPortalRef} />
        <div
          ref={circleRef}
          className="fixed z-0 left-1/2 top-1/2 h-4 w-4 scale-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-foreground origin-center will-change-transform"
          aria-hidden
        />
        <div className="relative z-10">
          <div className="mt-16">
            {children}
          </div>
          <Footer />
        </div>
      </main>
      </GalleryLightboxPortalContext.Provider>
    </ThemeContext.Provider>
  );
}
