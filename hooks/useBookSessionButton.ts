"use client";

import { useCallback } from "react";
import { useBooking } from "@/context/BookingContext";

export function useBookSessionButton(onAfterOpen?: () => void) {
  const { open } = useBooking();

  const handleClick = useCallback(() => {
    open();
    onAfterOpen?.();
  }, [open, onAfterOpen]);

  return { handleClick };
}
