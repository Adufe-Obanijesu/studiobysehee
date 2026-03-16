// TODO: Because of the circle expansion, when the preloader is loading and there is a resize in the browser, the animation should restart.

"use client";

import { usePreloader } from "@/hooks/usePreloader";
import { brands } from "@/data/brands";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

const LINE1 = "...all capture moments with";
const LINE2 = "Studio by Sehee";

export default function Preloader() {
  const { circleRef, line1Ref, line2Ref, gridRef } = usePreloader();
  const theme = useTheme();
  const isDark = theme !== null ? theme.isDark : false;

  return (
    <>
      <section id="preloader" className={cn("bg-background h-screen w-full relative z-10", isDark ? "light" : "dark")}>
        <div id="intro-2" className="flex h-screen flex-col items-center justify-center gap-6 opacity-0">
          <div className="overflow-hidden">
            <h1
              ref={line1Ref}
              className="md:text-2xl text-lg font-medium text-foreground"
              aria-label={LINE1}
            >
              {LINE1}
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-center md:gap-4 gap-2 -mt-4">
            <div className="overflow-hidden">
              <h2
                ref={line2Ref}
                className="lg:text-8xl md:text-7xl text-5xl font-bold leading-tight text-foreground"
                aria-label={LINE2}
              >
                {LINE2}
              </h2>
            </div>
            <div
              ref={circleRef}
              className="md:h-4 md:w-4 h-3 w-3 lg:mt-6 md:mt-4 mt-2 shrink-0 opacity-0 rounded-full bg-foreground"
              aria-hidden
            />
          </div>
        </div>

        <div id="intro-1" className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6 md:px-12">
          <div
            ref={gridRef}
            className="grid w-3xl mx-auto lg:grid-cols-4 md:grid-cols-4 grid-cols-3 gap-6"
            style={{ gridTemplateRows: "repeat(4, 1fr)" }}
          >
            {brands.map((brand, i) => {
              const Svg = brand.Svg;
              return (
                <div
                  key={`${brand.alt}-${i}`}
                  className={cn(
                    "grid-item flex items-center justify-center h-12 [&>svg]:h-full [&>svg]:w-auto",
                    brand.alt === brands[brands.length - 1].alt && "col-span-1", 
                    brand.alt === "Wells Fargo" && "hidden md:flex",
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
