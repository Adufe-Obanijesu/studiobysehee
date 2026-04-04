"use client";

import { useContext, useLayoutEffect, useState } from "react";
import { GalleryLightboxPortalContext } from "@/context/ThemeContext";

/** Resolves the ThemeProvider lightbox mount node after ref attachment (client-only). */
export function useGalleryLightboxPortalTarget(): HTMLDivElement | null {
  const portalRef = useContext(GalleryLightboxPortalContext);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!portalRef?.current) return;
    setTarget(portalRef.current);
  }, [portalRef]);

  return target;
}
