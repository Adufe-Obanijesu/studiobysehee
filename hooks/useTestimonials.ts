import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useTestimonials() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-testimonial-card]");
      if (!cards.length) return;

      gsap.set(cards, { autoAlpha: 0, y: 24 });

      ScrollTrigger.batch(cards, {
        start: "top 99%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            overwrite: "auto",
          });
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: containerRef }
  );

  return { containerRef };
}
