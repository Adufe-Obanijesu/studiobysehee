import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export function useAbout() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heading = headingRef.current;
      const info = infoRef.current;
      if (!heading || !info) return;
      const clientItems = gsap.utils.toArray<HTMLElement>("[data-client-item]");
      const touchLinks = gsap.utils.toArray<HTMLAnchorElement>("[data-about-link]");
      const removeTouchLinkListeners: Array<() => void> = [];

      const split = new SplitText(heading, {
        type: "lines",
        mask: "lines",
      });

      gsap.set(split.lines, { yPercent: 120, opacity: 0 });
      gsap.set(info, { opacity: 0 });
      gsap.set(clientItems, {
        scale: 1.5,
        opacity: 0,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const rowsByTop = new Map<number, HTMLElement[]>();
      for (const item of clientItems) {
        const rowItems = rowsByTop.get(item.offsetTop) ?? [];
        rowItems.push(item);
        rowsByTop.set(item.offsetTop, rowItems);
      }
      const rows = Array.from(rowsByTop.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, row]) => row);

      tl.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.12,
      }).to(
        info,
        {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
        },
        "-=0.25"
      );
      for (const row of rows) {
        tl.to(row, {
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: "back.out(1.7)",
        }, "<=40%");
      }

      // Link underline interaction:
      // - hover: line exits to the right
      // - mouse leave: line jumps off-screen left, then enters from left
      for (const link of touchLinks) {
        gsap.set(link, { "--link-underline-x": "0%" });

        const handleEnter = () => {
          gsap.killTweensOf(link);
          gsap.to(link, {
            "--link-underline-x": "100%",
            duration: 0.32,
            ease: "power2.out",
          });
        };

        const handleLeave = () => {
          gsap.killTweensOf(link);
          gsap.set(link, { "--link-underline-x": "-100%" });
          gsap.to(link, {
            "--link-underline-x": "0%",
            duration: 0.32,
            ease: "power2.out",
          });
        };

        link.addEventListener("mouseenter", handleEnter);
        link.addEventListener("mouseleave", handleLeave);

        removeTouchLinkListeners.push(() => {
          link.removeEventListener("mouseenter", handleEnter);
          link.removeEventListener("mouseleave", handleLeave);
        });
      }

      return () => {
        for (const removeListener of removeTouchLinkListeners) {
          removeListener();
        }
        split.revert();
      };
    },
    { scope: containerRef }
  );

  return { containerRef, headingRef, infoRef };
}
