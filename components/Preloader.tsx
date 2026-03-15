"use client";

import { usePreloader } from "@/hooks/usePreloader";
import { brands } from "@/data/brands";
import { cn } from "@/lib/utils";

const LINE1 = "Capture moments with";
const LINE2 = "Studio by Sehee";

export default function Preloader() {
  const { circleRef, line1Ref, line2Ref, gridRef } = usePreloader();

  return (
    <>
      <section className="ligh bg-background h-screen w-full">
        <div id="intro-2" className="flex h-screen flex-col items-center justify-center gap-6 opacity-0">
          <div className="overflow-hidden">
            <h1
              ref={line1Ref}
              className="text-2xl font-medium text-foreground"
              aria-label={LINE1}
            >
              {LINE1}
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 -mt-4">
            <div className="overflow-hidden">
              <h2
                ref={line2Ref}
                className="text-[96px] font-bold leading-none text-foreground"
                aria-label={LINE2}
              >
                {LINE2}
              </h2>
            </div>
            <div
              ref={circleRef}
              className="h-4 w-4 mt-6 shrink-0 opacity-0 rounded-full bg-foreground"
              aria-hidden
            />
          </div>
        </div>

        <div id="intro-1" className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
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
        </div>
      </section>
    </>
  );
}
