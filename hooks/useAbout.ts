import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

function getClientRows(clientItems: HTMLElement[]) {
  const rowsByTop = new Map<number, HTMLElement[]>();
  for (const item of clientItems) {
    const rowItems = rowsByTop.get(item.offsetTop) ?? [];
    rowItems.push(item);
    rowsByTop.set(item.offsetTop, rowItems);
  }

  return Array.from(rowsByTop.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, row]) => row);
}

function createHeadingSplit(
  heading: HTMLHeadingElement,
  headingAnimationRef: React.RefObject<gsap.core.Tween | null>,
  onNameTargetRefresh: (nameElement: HTMLSpanElement | null) => void
) {
  const split = new SplitText(heading, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    // deepSlice: true,
    onSplit(self) {
      const currentName = heading.querySelector("[data-about-name]") as HTMLSpanElement | null;
      onNameTargetRefresh(currentName);
      gsap.set(self.lines, { yPercent: 120, opacity: 0 });
      const revealHeadingLines = gsap.to(self.lines, { yPercent: 0, opacity: 1, stagger: 0.05 });
      headingAnimationRef.current = revealHeadingLines;
      return revealHeadingLines;
    },
  });
  return split;
}

function createNamePulseLoop(name: HTMLSpanElement) {
  gsap.set(name, { scale: 1, transformOrigin: "50% 50%" });

  const loop = gsap.timeline({
    repeat: -1,
    defaults: { ease: "power1.inOut" },
    paused: true,
  });

  loop.to(name, { scale: 1.03, duration: 0.35 }).to(name, { scale: 1, duration: 0.35 });
  loop.repeatDelay(5);
  return loop;
}

function setInitialVisualStates({
  info,
  clientItems,
  overlay,
  previewImageContainer,
  namePreview,
  overlayCursorClose,
}: {
  info: HTMLDivElement;
  clientItems: HTMLElement[];
  overlay: HTMLDivElement;
  previewImageContainer: HTMLDivElement;
  namePreview: HTMLDivElement;
  overlayCursorClose: HTMLDivElement;
}) {
  gsap.set(info, { opacity: 0 });
  gsap.set(clientItems, { scale: 1.5, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set(overlay, { autoAlpha: 0 });
  gsap.set(previewImageContainer, { autoAlpha: 0, scale: 0.4 });
  gsap.set(namePreview, { autoAlpha: 0, scale: 0.96 });
  gsap.set(overlayCursorClose, { autoAlpha: 0 });
}

function revealHeadingLines(lines: HTMLElement[], isIntroPlayed: boolean) {
  gsap.set(lines, { yPercent: isIntroPlayed ? 0 : 120, opacity: isIntroPlayed ? 1 : 0 });
}

function animatePreviewOpen({
  overlay,
  previewImageContainer,
}: {
  overlay: HTMLDivElement;
  previewImageContainer: HTMLDivElement;
}) {
  gsap.to(overlay, { autoAlpha: 1, duration: 0.35 });
  gsap.fromTo(
    previewImageContainer,
    { scale: 0.4, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.6, ease: "power3.out" }
  );
}

export function useAbout() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const namePreviewRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayCursorCloseRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previewImageContainerRef = useRef<HTMLDivElement>(null);
  const headingAnimationRef = useRef<gsap.core.Tween | null>(null);

  const isPreviewOpenRef = useRef(false);
  const introPlayedRef = useRef(false);
  const namePulseLoopRef = useRef<gsap.core.Timeline | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const closePreview = useCallback(() => {
    if (!isPreviewOpenRef.current) return;
    isPreviewOpenRef.current = false;
    gsap.set(namePreviewRef.current, { autoAlpha: 0, scale: 0.98 });
    gsap.set(overlayCursorCloseRef.current, { autoAlpha: 0 });

    gsap.to(previewImageContainerRef.current, {
      scale: 0.4,
      autoAlpha: 0,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        gsap.set(previewImageContainerRef.current, { transformOrigin: "50% 50%" });
      },
    });
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.45,
      delay: 0.05,
      onComplete: () => {
        namePulseLoopRef.current?.resume();
        lastFocusedElementRef.current?.focus();
        lastFocusedElementRef.current = null;
      },
    });
  }, []);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const refreshNamePulseTarget = useCallback((nameElement: HTMLSpanElement | null) => {
    namePulseLoopRef.current?.kill();
    namePulseLoopRef.current = null;
    if (!nameElement) return;

    const namePulseLoop = createNamePulseLoop(nameElement);
    namePulseLoopRef.current = namePulseLoop;
    if (introPlayedRef.current) {
      namePulseLoop.play(0);
    }
  }, []);

  useGSAP(
    () => {
      const heading = headingRef.current;
      const info = infoRef.current;
      const namePreview = namePreviewRef.current;
      const overlay = overlayRef.current;
      const previewImageContainer = previewImageContainerRef.current;
      const overlayCursorClose = overlayCursorCloseRef.current;

      if (!heading || !info || !namePreview || !overlay || !previewImageContainer || !overlayCursorClose) return;

      const clientItems = gsap.utils.toArray<HTMLElement>("[data-client-item]");
      const split = createHeadingSplit(heading, headingAnimationRef, refreshNamePulseTarget);
      const rows = getClientRows(clientItems);
      const splitLines = split.lines as HTMLElement[];

      setInitialVisualStates({
        info,
        clientItems,
        overlay,
        previewImageContainer,
        namePreview,
        overlayCursorClose,
      });
      gsap.set(containerRef.current, { autoAlpha: 1 });
      revealHeadingLines(splitLines, introPlayedRef.current);
      
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }});
      if (headingAnimationRef.current) {
        tl.add(headingAnimationRef.current);
      }
      tl.to(
        info,
        { opacity: 1, duration: 0.7, ease: "power2.out" },
        "<+75%"
      );
      for (const row of rows) {
        tl.to(row, { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)" }, "<=40%");
      }

      tl.eventCallback("onComplete", () => {
        introPlayedRef.current = true;
        namePulseLoopRef.current?.play(0);
      });

      return () => {
        tl.kill();
        split.revert();
        namePulseLoopRef.current?.kill();
        namePulseLoopRef.current = null;
      };
    },
    { scope: containerRef, dependencies: [refreshNamePulseTarget] }
  );

  useGSAP(
    () => {
      const heading = headingRef.current;
      const namePreview = namePreviewRef.current;
      const overlay = overlayRef.current;
      const overlayCursorClose = overlayCursorCloseRef.current;
      const previewImageContainer = previewImageContainerRef.current;
      if (!heading || !namePreview || !overlay || !overlayCursorClose || !previewImageContainer) return;

      const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
      let isHoverDevice = hoverMediaQuery.matches;
      const movePreviewX = gsap.quickTo(namePreview, "x", { duration: 0.4, ease: "power3.out" });
      const movePreviewY = gsap.quickTo(namePreview, "y", { duration: 0.4, ease: "power3.out" });
      const moveOverlayCursorCloseX = gsap.quickTo(overlayCursorClose, "x", {
        duration: 0.3,
        ease: "power3.out",
      });
      const moveOverlayCursorCloseY = gsap.quickTo(overlayCursorClose, "y", {
        duration: 0.3,
        ease: "power3.out",
      });
      let isNameHovered = false;
      let isOverlayHovered = false;

      const getNameTarget = (target: EventTarget | null) => {
        if (!(target instanceof Element)) return null;
        return target.closest("[data-about-name]") as HTMLSpanElement | null;
      };

      const showNamePreview = () => {
        if (isNameHovered || isPreviewOpenRef.current) return;
        isNameHovered = true;
        namePulseLoopRef.current?.pause();
        gsap.to(namePreview, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" });
      };

      const hideNamePreview = () => {
        if (!isNameHovered || isPreviewOpenRef.current) return;
        isNameHovered = false;
        namePulseLoopRef.current?.resume();
        gsap.to(namePreview, { autoAlpha: 0, scale: 0.98, duration: 0.35, ease: "power2.out" });
      };

      const handleHoverCapabilityChange = (event: MediaQueryListEvent) => {
        isHoverDevice = event.matches;
        if (!isHoverDevice) {
          isNameHovered = false;
          isOverlayHovered = false;
          gsap.set(namePreview, { autoAlpha: 0, scale: 0.98 });
          gsap.set(overlayCursorClose, { autoAlpha: 0 });
        }
      };

      const showOverlayCursorClose = () => {
        if (!isPreviewOpenRef.current || isOverlayHovered || !isHoverDevice) return;
        isOverlayHovered = true;
        gsap.to(overlayCursorClose, { autoAlpha: 1, duration: 0.2, ease: "power2.out" });
      };

      const hideOverlayCursorClose = () => {
        if (!isOverlayHovered) return;
        isOverlayHovered = false;
        gsap.to(overlayCursorClose, { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
      };

      const handleHeadingMouseOver = (event: MouseEvent) => {
        if (!isHoverDevice || !getNameTarget(event.target)) return;
        showNamePreview();
      };

      const handleHeadingMouseMove = (event: MouseEvent) => {
        if (!isHoverDevice || !getNameTarget(event.target) || isPreviewOpenRef.current) return;
        showNamePreview();
        movePreviewX(event.clientX - 110);
        movePreviewY(event.clientY + 18);
      };

      const handleHeadingMouseOut = (event: MouseEvent) => {
        if (!isHoverDevice) return;
        const currentName = getNameTarget(event.target);
        if (!currentName) return;
        const nextName = getNameTarget(event.relatedTarget);
        if (nextName === currentName) return;
        hideNamePreview();
      };

      const handleHeadingClick = (event: MouseEvent) => {
        const clickedName = getNameTarget(event.target);
        if (!clickedName || isPreviewOpenRef.current) return;

        lastFocusedElementRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        isPreviewOpenRef.current = true;

        isNameHovered = false;
        isOverlayHovered = false;
        gsap.set(namePreview, { autoAlpha: 0, scale: 0.98 });
        gsap.set(overlayCursorClose, { autoAlpha: 0 });

        namePulseLoopRef.current?.pause();
        animatePreviewOpen({ overlay, previewImageContainer });
        closeButtonRef.current?.focus();
      };

      const handleOverlayMouseEnter = () => {
        if (!isHoverDevice || !isPreviewOpenRef.current) return;
        showOverlayCursorClose();
      };

      const handleOverlayMouseMove = (event: MouseEvent) => {
        if (!isHoverDevice || !isPreviewOpenRef.current) return;
        showOverlayCursorClose();
        moveOverlayCursorCloseX(event.clientX - 18);
        moveOverlayCursorCloseY(event.clientY + 25);
      };

      const handleOverlayMouseLeave = () => {
        hideOverlayCursorClose();
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isPreviewOpenRef.current) return;

        if (event.key === "Escape") {
          closePreview();
          return;
        }

        if (event.key !== "Tab") return;
        const focusableElements = overlay.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
          return;
        }

        if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      hoverMediaQuery.addEventListener("change", handleHoverCapabilityChange);
      heading.addEventListener("mouseover", handleHeadingMouseOver);
      heading.addEventListener("mousemove", handleHeadingMouseMove);
      heading.addEventListener("mouseout", handleHeadingMouseOut);
      heading.addEventListener("click", handleHeadingClick);
      overlay.addEventListener("mouseenter", handleOverlayMouseEnter);
      overlay.addEventListener("mousemove", handleOverlayMouseMove);
      overlay.addEventListener("mouseleave", handleOverlayMouseLeave);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        hoverMediaQuery.removeEventListener("change", handleHoverCapabilityChange);
        heading.removeEventListener("mouseover", handleHeadingMouseOver);
        heading.removeEventListener("mousemove", handleHeadingMouseMove);
        heading.removeEventListener("mouseout", handleHeadingMouseOut);
        heading.removeEventListener("click", handleHeadingClick);
        overlay.removeEventListener("mouseenter", handleOverlayMouseEnter);
        overlay.removeEventListener("mousemove", handleOverlayMouseMove);
        overlay.removeEventListener("mouseleave", handleOverlayMouseLeave);
        window.removeEventListener("keydown", handleKeyDown);
      };
    },
    { scope: containerRef, dependencies: [closePreview] }
  );

  return {
    containerRef,
    headingRef,
    infoRef,
    nameRef,
    namePreviewRef,
    overlayRef,
    overlayCursorCloseRef,
    closeButtonRef,
    previewImageContainerRef,
    isImageLoaded,
    handleImageLoad,
    closePreview,
  };
}
