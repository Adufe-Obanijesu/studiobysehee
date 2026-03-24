import { useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function useLenis(options = {}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  const defaultOptions = useMemo(() => {
    return {
      lerp: 0.05,
      smooth: true,
      touchMultiplier: 0.8,
      wheelMultiplier: 0.8,
      ...options,
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis(defaultOptions);
    setLenis(lenis);

    const onLenisScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", onLenisScroll);

    gsap.ticker.add(onTick);

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      gsap.ticker.remove(onTick);
    };
  }, [defaultOptions]);

  return lenis;
}
