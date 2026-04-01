"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** App UI gates: initial load preloader and mobile overlay transitions. */
type PreloaderContextValue = {
  preloaderComplete: boolean;
  markPreloaderFinished: () => void;
  /** False while the mobile menu close animation is running (after it was open). */
  mobileNavAllowsPageAnimations: boolean;
  markMobileNavCloseStarted: () => void;
  markMobileNavCloseFinished: () => void;
};

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

/** Returns null when used outside PreloaderProvider (e.g. tests). */
export function usePreloaderContext(): PreloaderContextValue | null {
  return useContext(PreloaderContext);
}

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [mobileNavAllowsPageAnimations, setMobileNavAllowsPageAnimations] =
    useState(true);

  const markPreloaderFinished = useCallback(() => {
    setPreloaderComplete(true);
  }, []);

  const markMobileNavCloseStarted = useCallback(() => {
    setMobileNavAllowsPageAnimations(false);
  }, []);

  const markMobileNavCloseFinished = useCallback(() => {
    setMobileNavAllowsPageAnimations(true);
  }, []);

  const value = useMemo(
    () => ({
      preloaderComplete,
      markPreloaderFinished,
      mobileNavAllowsPageAnimations,
      markMobileNavCloseStarted,
      markMobileNavCloseFinished,
    }),
    [
      preloaderComplete,
      markPreloaderFinished,
      mobileNavAllowsPageAnimations,
      markMobileNavCloseStarted,
      markMobileNavCloseFinished,
    ]
  );

  return (
    <PreloaderContext.Provider value={value}>
      {children}
    </PreloaderContext.Provider>
  );
}
