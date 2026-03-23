"use client";

import Link from "next/link";
import { useAbout } from "@/hooks/useAbout";
import {
  ABOUT_BIO,
  ABOUT_CLIENTS,
  ABOUT_CONTACT,
} from "@/data/about";
import { cn } from "@/lib/utils";

export default function About() {
  const { containerRef, headingRef, infoRef } = useAbout();

  return (
    <section
      ref={containerRef}
      className="min-h-[calc(100svh-3.5rem)] flex flex-col max-w-7xl mx-auto px-8 md:px-12 lg:px-16 pb-10 lg:pb-14"
    >
      {/* Heading */}
      <div className="flex-1 flex items-center justify-center py-16 md:py-20">
        <h1
          ref={headingRef}
          className="font-cormorant font-bold uppercase text-center leading-[1.05] tracking-[.1vw] text-[clamp(2.2rem,4vw,4rem)] overflow-hidden"
        >
          {ABOUT_BIO}
        </h1>
      </div>

      {/* Bottom info strip */}
      <div
        ref={infoRef}
        className="flex flex-col md:flex-row md:justify-between md:items-start gap-12 md:gap-8 border-t border-foreground/15 pt-8"
      >
        {/* SELECT CLIENTS — shown below GET IN TOUCH on mobile */}
        <div className="flex flex-col lg:flex-row items-start xl:gap-16 lg:gap-8 gap-4">
          <span className="text-sm uppercase font-bold text-foreground/90">
            Selected Clients
          </span>
          <ul className="grid grid-cols-2">
            {ABOUT_CLIENTS.map((client, index) => (
              <li
                key={client}
                className={cn("font-dm text-sm uppercase tracking-wide text-foreground font-medium", client === "Rockefeller Center" && "col-span-2")}
              >
                {client}
              </li>
            ))}
          </ul>
        </div>

        {/* GET IN TOUCH — shown first on mobile */}
        <div className="flex flex-col lg:flex-row xl:gap-16 lg:gap-8 gap-4">
          <span className="text-sm uppercase font-bold text-foreground/90">
            Get in Touch
          </span>
          <div className="flex flex-col gap-4 font-medium">
            <Link
              href={`mailto:${ABOUT_CONTACT.email}`}
              className="text-sm uppercase tracking-wide text-foreground underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground transition-colors duration-200"
            >
              {ABOUT_CONTACT.email}
            </Link>
            <span className="font-dm text-sm uppercase tracking-wide text-foreground">
              {ABOUT_CONTACT.phone}
            </span>
            <Link
              href={ABOUT_CONTACT.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-dm text-sm uppercase tracking-wide text-foreground underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground transition-colors duration-200"
            >
              {ABOUT_CONTACT.instagram.label}
            </Link>
            <Link
              href={ABOUT_CONTACT.siteCredits.href}
              className="font-dm text-sm uppercase tracking-wide text-foreground underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground transition-colors duration-200"
            >
              {ABOUT_CONTACT.siteCredits.label}
            </Link>
        </div>
        </div>
      </div>
    </section>
  );
}
