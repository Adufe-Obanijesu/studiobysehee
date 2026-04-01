"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PreloaderContextValue = {
  preloaderComplete: boolean;
  markPreloaderFinished: () => void;
};

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

/** Returns null when used outside PreloaderProvider (e.g. tests). */
export function usePreloaderContext(): PreloaderContextValue | null {
  return useContext(PreloaderContext);
}

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [preloaderComplete, setPreloaderComplete] = useState(false);

  const markPreloaderFinished = useCallback(() => {
    setPreloaderComplete(true);
  }, []);

  const value = useMemo(
    () => ({ preloaderComplete, markPreloaderFinished }),
    [preloaderComplete, markPreloaderFinished]
  );

  return (
    <PreloaderContext.Provider value={value}>
      {children}
    </PreloaderContext.Provider>
  );
}
