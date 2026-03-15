"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { brands } from "@/data/brands";
import { cn } from "@/lib/utils";


const STAGGER_AMOUNT = 0.1;
const COLS = 5;

export default function Preloader2() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    setAllLoaded(true);
  }, []);

  useGSAP(
    () => {
      if (!allLoaded || !gridRef.current) return;
      const items = gridRef.current.querySelectorAll<HTMLElement>(".grid-item");
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, scale: .50, transformOrigin: "bottom", yPercent: 25});
      const tl = gsap.timeline();
      tl
      .to(items, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
        delay: (i) => Math.floor(i / COLS) * STAGGER_AMOUNT,
      });
      tl
      .set(items, {transformOrigin: "top"})
      .to(
        items,
        { scale: .5, yPercent: -25, duration: 0.4, ease: "back.in", 

          delay: (i) => Math.floor(i / COLS) * STAGGER_AMOUNT,
         },
        "+=1"
      );
      tl.to(items, { autoAlpha: 0, duration: 0.4, ease: "back.in", delay: (i) => Math.floor(i / COLS) * STAGGER_AMOUNT, }, "<");

      
    },
    { dependencies: [allLoaded] }
  );

  return (
    <section className="flex min-h-screen items-center justify-center bg-background p-6">
      <div
        ref={gridRef}
        className="grid w-3xl mx-auto grid-cols-4 gap-6"
        style={{ gridTemplateRows: "repeat(4, 1fr)" }}
      >
        {brands.map((brand, i) => {
          const Svg = brand.Svg;
          return (
            <div
              key={`${brand.alt}-${i}`}
              className={cn(
                "grid-item flex items-center justify-center h-12 [&>svg]:h-full [&>svg]:w-auto",
                brand.alt === brands[brands.length - 1].alt && "col-span-1"
              )}
              style={{ opacity: 0 }}
            >
              <Svg
                width={96}
                height={60}
                className="h-full max-h-16 w-auto object-contain"
                aria-label={brand.alt}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
