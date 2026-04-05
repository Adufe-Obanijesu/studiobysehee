"use client";

import { useCallback, useState } from "react";

export function useLazyVideoEmbed() {
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    setIsActive(true);
  }, []);

  return { isActive, activate };
}
