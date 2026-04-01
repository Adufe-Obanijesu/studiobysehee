"use client";

import { useBooking } from "@/context/BookingContext";
import {
  DISCOVERY_SOURCE_OPTIONS,
  SHOOT_LOCATION_OPTIONS,
} from "@/data/booking";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

const CIRCLE_PX = 16;
const DURATION_CIRCLE = 1.2;
const EASE_CIRCLE = "power3.inOut";

export function useBookingModal() {
  const { isOpen, close } = useBooking();
  const scopeRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasOpenedOnceRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [discovery, setDiscovery] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!location.trim() || !discovery.trim()) return;
      close();
    },
    [close, location, discovery]
  );

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const circle = circleRef.current;
      const panel = panelRef.current;
      if (!scope || !circle || !panel) return;

      gsap.set(circle, {
        transformOrigin: "50% 50%",
        scale: 0,
      });
      gsap.set(panel, { opacity: 0 });
      gsap.set(scope, {
        autoAlpha: 0,
        pointerEvents: "none",
      });

      const fields = gsap.utils.toArray<HTMLElement>(
        scope.querySelectorAll(".booking-form-field")
      );
      if (fields.length) {
        gsap.set(fields, {
          scale: 0,
          opacity: 1,
          transformOrigin: "50% 50%",
        });
      }

      return () => {
        openTimelineRef.current?.kill();
        openTimelineRef.current = null;
        closeTimelineRef.current?.kill();
        closeTimelineRef.current = null;
      };
    },
    { scope: scopeRef }
  );

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const circle = circleRef.current;
      const panel = panelRef.current;
      if (!scope || !circle || !panel) return;

      const fields = gsap.utils.toArray<HTMLElement>(
        scope.querySelectorAll(".booking-form-field")
      );

      if (isOpen) {
        hasOpenedOnceRef.current = true;
        closeTimelineRef.current?.kill();
        closeTimelineRef.current = null;
        openTimelineRef.current?.kill();

        gsap.set(scope, { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(panel, { opacity: 0 });
        gsap.set(circle, { scale: 0 });
        if (fields.length) {
          gsap.set(fields, { scale: 0, opacity: 1 });
        }

        const maxSize = Math.max(window.innerWidth, window.innerHeight);
        const finalScale = (maxSize / CIRCLE_PX) * 2.5;

        const tl = gsap.timeline();
        tl.to(circle, {
          scale: finalScale,
          duration: DURATION_CIRCLE,
          ease: EASE_CIRCLE,
        })
          .to(
            panel,
            {
              opacity: 1,
              duration: 0.25,
            },
            "-=0.35"
          )
          .to(
            fields,
            {
              scale: 1,
              opacity: 1,
              duration: 0.55,
              ease: "back.out(1.7)",
              stagger: 0.06,
            },
            "-=0.2"
          );

        openTimelineRef.current = tl;
        return;
      }

      if (!hasOpenedOnceRef.current) return;

      openTimelineRef.current?.kill();
      openTimelineRef.current = null;

      const ctl = gsap.timeline({
        onComplete: () => {
          gsap.set(scope, { autoAlpha: 0, pointerEvents: "none" });
          gsap.set(circle, { scale: 0 });
          gsap.set(panel, { opacity: 0 });
          if (fields.length) {
            gsap.set(fields, { scale: 0, opacity: 1 });
          }
        },
      });

      if (fields.length) {
        ctl.to(fields, {
          scale: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          stagger: { each: 0.03, from: "end" },
        });
      }

      ctl
        .to(
          panel,
          {
            opacity: 0,
            duration: 0.2,
          },
          fields.length ? "-=0.12" : 0
        )
        .to(
          circle,
          {
            scale: 0,
            duration: DURATION_CIRCLE,
            ease: EASE_CIRCLE,
          },
          "-=0.08"
        );

      closeTimelineRef.current = ctl;
    },
    { dependencies: [isOpen], scope: scopeRef }
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return {
    scopeRef,
    circleRef,
    panelRef,
    close,
    name,
    setName,
    email,
    setEmail,
    dateTime,
    setDateTime,
    location,
    setLocation,
    discovery,
    setDiscovery,
    message,
    setMessage,
    handleSubmit,
    shootLocationOptions: SHOOT_LOCATION_OPTIONS,
    discoveryOptions: DISCOVERY_SOURCE_OPTIONS,
  };
}
