import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useTestimonials() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // gsap.to(
      //   containerRef.current,
      //   {
      //     autoAlpha: 1,
      //     // delay: 1
      //   }
      // );

      const cards = gsap.utils.toArray<HTMLElement>("[data-testimonial-card]");
      if (!cards.length) return;

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            overwrite: "auto",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      ScrollTrigger.refresh();
    },
    {scope: containerRef}
  );

  return { containerRef };
}
