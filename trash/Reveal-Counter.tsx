"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface RevealCounterProps {
  onComplete?: () => void;
}

export default function RevealCounter({ onComplete }: RevealCounterProps) {
  const counter1Ref = useRef<HTMLDivElement>(null);
  const counter2Ref = useRef<HTMLDivElement>(null);
  const counter3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c1 = counter1Ref.current;
    const c2 = counter2Ref.current;
    const c3 = counter3Ref.current;
    if (!c1 || !c2 || !c3) return;

    const numHeight = c3.querySelector<HTMLDivElement>(".num")!.clientHeight;

    function scrollCounter(
      el: HTMLDivElement,
      duration: number,
      delay: number = 0
    ): void {
      const total = (el.querySelectorAll(".num").length - 1) * numHeight;
      gsap.to(el, {
        y: -total,
        duration,
        delay,
        ease: "power2.inOut",
      });
    }

    // Units: scrolls through 0–9 twice + final 0 (21 nums)
    scrollCounter(c3, 5, 0);
    // Tens: scrolls 0–9 + final 0 (11 nums)
    scrollCounter(c2, 6, 0);
    // Hundreds: just 0 → 1 (2 nums), starts at 4s
    scrollCounter(c1, 2, 4);

    // Exit: each digit column flies up with stagger
    gsap.to([c1, c2, c3], {
      top: "-150px",
      stagger: { amount: 0.25 },
      delay: 6,
      duration: 1,
      ease: "power4.inOut",
    });
  }, [onComplete]);

  return (
      <div
        className="
        text-muted-foreground
          fixed right-[50px] bottom-[50px]
          flex
          h-[100px]
          text-[100px] leading-[102px] font-light
          [clip-path:polygon(0_0,100%_0,100%_100px,0_100px)]
        "
      >
        {/* Hundreds — 0 then 1 */}
        <div ref={counter1Ref} className="relative top-[-12px]">
          <div className="num block">0</div>
          {/* "1" is optically narrower — nudge it right to align with other digits */}
          <div className="num relative flex justify-end">1</div>
        </div>

        {/* Tens — 0 through 9 then back to 0 */}
        <div ref={counter2Ref} className="relative top-[-12px]">
          {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as number[]).map((n, i) => (
            <div
              key={i}
              className={`num block${i === 1 ? " relative right-[-10px]" : ""}`}
            >
              {n}
            </div>
          ))}
        </div>

        {/* Units — 0–9 twice then final 0 (21 items total) */}
        <div ref={counter3Ref} className="relative top-[-12px]">
          {Array.from({ length: 21 }, (_, i) => (
            <div key={i} className="num block">
              {i === 20 ? 0 : i % 10}
            </div>
          ))}
        </div>
      </div>
  );
}