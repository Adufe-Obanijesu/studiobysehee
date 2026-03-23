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

      return () => {
        split.revert();
      };
    },
    { scope: containerRef }
  );

  return { containerRef, headingRef, infoRef };
}
