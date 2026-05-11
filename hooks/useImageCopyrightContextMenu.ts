"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEventHandler, MouseEventHandler } from "react";

const LONG_PRESS_DELAY_MS = 500;
const MOVE_CANCEL_THRESHOLD_PX = 8;

type TriggerProps = {
  onPointerDownCapture: PointerEventHandler<HTMLElement>;
  onPointerUpCapture: PointerEventHandler<HTMLElement>;
  onPointerCancelCapture: PointerEventHandler<HTMLElement>;
  onPointerMoveCapture: PointerEventHandler<HTMLElement>;
  onContextMenuCapture: MouseEventHandler<HTMLElement>;
  onClickCapture: MouseEventHandler<HTMLElement>;
};

export function useImageCopyrightContextMenu() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchPressActiveRef = useRef(false);
  const didLongPressOpenRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  const clearLongPressTimer = useCallback(() => {
    if (timerRef.current == null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const cancelTouchPress = useCallback(() => {
    clearLongPressTimer();
    isTouchPressActiveRef.current = false;
    startPointRef.current = null;
  }, [clearLongPressTimer]);

  const handleWindowScroll = useCallback(() => {
    if (!isTouchPressActiveRef.current) return;
    cancelTouchPress();
  }, [cancelTouchPress]);

  const cleanupGlobalTouchEndListeners = useCallback(() => {
    window.removeEventListener("pointerup", cancelTouchPress, true);
    window.removeEventListener("pointercancel", cancelTouchPress, true);
    window.removeEventListener("touchend", cancelTouchPress, true);
    window.removeEventListener("touchcancel", cancelTouchPress, true);
  }, [cancelTouchPress]);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
      window.removeEventListener("scroll", handleWindowScroll, true);
      cleanupGlobalTouchEndListeners();
    };
  }, [clearLongPressTimer, cleanupGlobalTouchEndListeners, handleWindowScroll]);

  const onPointerDownCapture: PointerEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (event.pointerType !== "touch") return;
      event.preventDefault();

      didLongPressOpenRef.current = false;
      isTouchPressActiveRef.current = true;
      startPointRef.current = { x: event.clientX, y: event.clientY };

      window.addEventListener("scroll", handleWindowScroll, true);
      window.addEventListener("pointerup", cancelTouchPress, true);
      window.addEventListener("pointercancel", cancelTouchPress, true);
      window.addEventListener("touchend", cancelTouchPress, true);
      window.addEventListener("touchcancel", cancelTouchPress, true);

      clearLongPressTimer();
      const target = event.currentTarget;
      const { clientX, clientY } = event;
      timerRef.current = setTimeout(() => {
        didLongPressOpenRef.current = true;
        isTouchPressActiveRef.current = false;
        startPointRef.current = null;
        target.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
          }),
        );
        window.removeEventListener("scroll", handleWindowScroll, true);
        cleanupGlobalTouchEndListeners();
      }, LONG_PRESS_DELAY_MS);
    },
    [cancelTouchPress, cleanupGlobalTouchEndListeners, clearLongPressTimer, handleWindowScroll],
  );

  const onPointerUpCapture: PointerEventHandler<HTMLElement> = useCallback(() => {
    cancelTouchPress();
    window.removeEventListener("scroll", handleWindowScroll, true);
    cleanupGlobalTouchEndListeners();
  }, [cancelTouchPress, cleanupGlobalTouchEndListeners, handleWindowScroll]);

  const onPointerCancelCapture: PointerEventHandler<HTMLElement> = useCallback(
    () => {
      cancelTouchPress();
      window.removeEventListener("scroll", handleWindowScroll, true);
      cleanupGlobalTouchEndListeners();
    },
    [cancelTouchPress, cleanupGlobalTouchEndListeners, handleWindowScroll],
  );

  const onPointerMoveCapture: PointerEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (!isTouchPressActiveRef.current || startPointRef.current == null) return;

      const deltaX = Math.abs(event.clientX - startPointRef.current.x);
      const deltaY = Math.abs(event.clientY - startPointRef.current.y);
      if (
        deltaX > MOVE_CANCEL_THRESHOLD_PX ||
        deltaY > MOVE_CANCEL_THRESHOLD_PX
      ) {
        cancelTouchPress();
        window.removeEventListener("scroll", handleWindowScroll, true);
        cleanupGlobalTouchEndListeners();
      }
    },
    [cancelTouchPress, cleanupGlobalTouchEndListeners, handleWindowScroll],
  );

  const onContextMenuCapture: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (didLongPressOpenRef.current) return;
      if (isTouchPressActiveRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [],
  );

  const onClickCapture: MouseEventHandler<HTMLElement> = useCallback((event) => {
    if (!didLongPressOpenRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    didLongPressOpenRef.current = false;
  }, []);

  const triggerProps: TriggerProps = {
    onPointerDownCapture,
    onPointerUpCapture,
    onPointerCancelCapture,
    onPointerMoveCapture,
    onContextMenuCapture,
    onClickCapture,
  };

  return {
    triggerProps,
  };
}
