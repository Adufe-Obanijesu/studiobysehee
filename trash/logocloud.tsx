import { brands } from "@/data/brands";
import { useGSAP } from "@gsap/react";
import { Fragment, useRef } from "react";

export default function LogoCloud() {
    
  const trackRef = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        const track = trackRef.current;
        if (!track) return;
        const firstBrand: HTMLElement[] = gsap.utils.toArray("#brands-marquee");
        const xValue = firstBrand[0].clientWidth * -1;
        gsap.effects.infiniteSlide(track, {
          x: () => xValue,
          xPercent: 0,
          duration: 20,
          ease: "none",
        });
      }, []);
  return (
    <div className="flex items-center gap-3">
        <p className="text-2xl font-medium text-primary">Clients:</p>
        <div
          className="w-full max-w-3xl mx-auto overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div ref={trackRef} className="inline-flex w-max">
            <div id="brands-marquee">
              <BrandList />
            </div>
            <BrandList />
            <BrandList />
          </div>
        </div>
      </div>
  );
}

function BrandList() {
    return (
      <div className="flex shrink-0 items-center gap-12 whitespace-nowrap pl-12">
        {brands.map((brand, i) => {
          const Svg = brand.Svg;
          return (
            <Fragment key={`${brand.alt}-${i}`}>
              <div className="relative h-20 w-24 flex items-center justify-center">
                <Svg
                  width={96}
                  height={60}
                  className="object-contain object-center h-full w-full grayscale"
                  aria-label={brand.alt}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
    );
  }