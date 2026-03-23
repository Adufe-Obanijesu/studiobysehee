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

      const split = new SplitText(heading, { type: "words", wordsClass: "tracking-tighter" });

      gsap.set(split.words, { yPercent: 110, opacity: 0 });
      gsap.set(info, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(split.words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.055,
      }).to(
        info,
        {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
        },
        "-=0.3"
      );

      return () => {
        split.revert();
      };
    },
    { scope: containerRef }
  );

  return { containerRef, headingRef, infoRef };
}
