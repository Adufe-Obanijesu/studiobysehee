"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type PageTransitionContextType = {
  isNavigating: boolean;
  startNavigation: () => void;
  finishNavigation: () => void;
};

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error("usePageTransition must be used within a PageTransitionProvider");
  }
  return context;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const finishNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  return (
    <PageTransitionContext.Provider value={{ isNavigating, startNavigation, finishNavigation }}>
      {children}
    </PageTransitionContext.Provider>
  );
}
