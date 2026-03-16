"use client";

import { useEffect, useRef } from "react";

export function useBookSessionButtonDebug() {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return;

    const el = buttonRef.current;
    if (!el) return;

    const parent = el.parentElement;
    const grandParent = parent?.parentElement ?? null;
    const rootMobileMenu =
      el.closest<HTMLElement>("#mobile-main-menu") ?? null;

    const parentStyle = parent ? window.getComputedStyle(parent) : null;

    const data = {
      buttonOffsetHeight: el.offsetHeight,
      buttonClientHeight: el.clientHeight,
      parentOffsetHeight: parent?.offsetHeight ?? null,
      parentClientHeight: parent?.clientHeight ?? null,
      grandParentOffsetHeight: grandParent?.offsetHeight ?? null,
      grandParentDisplay: grandParent
        ? window.getComputedStyle(grandParent).display
        : null,
      parentDisplay: parentStyle?.display ?? null,
      parentAlignItems: parentStyle?.alignItems ?? null,
      parentJustifyContent: parentStyle?.justifyContent ?? null,
      isInMobileMenu: !!rootMobileMenu,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };

    // #region agent log debug-173909
    fetch(
      "http://127.0.0.1:7729/ingest/5d55eb9f-7f5b-42c0-a1b0-4f2c77f49a6f",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "173909",
        },
        body: JSON.stringify({
          sessionId: "173909",
          runId: "pre-fix-1",
          hypothesisId: "H1-H3",
          location: "hooks/useBookSessionButtonDebug.ts:18",
          message: "BookSessionButton layout metrics (mobile)",
          data,
          timestamp: Date.now(),
        }),
      }
    ).catch(() => {});
    // #endregion
  }, []);

  return { buttonRef };
}

