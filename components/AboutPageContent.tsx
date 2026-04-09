"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { TransitionLink as Link } from "@/components/TransitionLink";
import { useAbout } from "@/hooks/useAbout";
import { useNavLinkHover } from "@/hooks/useNavbar";
import {
  ABOUT_BIO_REST,
  ABOUT_CLIENTS,
  ABOUT_CONTACT,
  ABOUT_NAME,
  ABOUT_PORTRAIT_SRC,
  ABOUT_PORTRAIT_WIDTH,
  ABOUT_PORTRAIT_HEIGHT,
} from "@/data/about";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { HiOutlineX } from "react-icons/hi";

type AnimatedAboutLinkProps = {
  href: string;
  label: string;
  className?: string;
  target?: "_blank";
  rel?: string;
};

function AnimatedAboutLink({
  href,
  label,
  className,
  target,
  rel,
}: AnimatedAboutLinkProps) {
  const { wrapperRef, line1Ref, line2Ref, onMouseEnter, onMouseLeave } =
    useNavLinkHover();

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "w-fit text-sm uppercase tracking-wide text-foreground inline-block leading-tight",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        ref={wrapperRef}
        className="relative inline-block h-[1.2em] leading-tight align-middle"
      >
        <span aria-hidden className="invisible block leading-tight pr-1">
          {label}
        </span>
        <span
          ref={line1Ref}
          className="absolute top-0 left-0 block leading-tight"
        >
          {label}
        </span>
        <span
          ref={line2Ref}
          className="absolute top-0 left-0 block leading-tight"
        >
          {label}
        </span>
      </span>
    </Link>
  );
}

export default function AboutPageContent() {
  const {
    containerRef,
    headingRef,
    infoRef,
    nameRef,
    namePreviewRef,
    overlayRef,
    overlayCursorCloseRef,
    closeButtonRef,
    previewImageContainerRef,
    isImageLoaded,
    handleImageLoad,
    closePreview,
    previewPortalTarget,
  } = useAbout();

  const previewOverlay =
    previewPortalTarget != null
      ? createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Portrait of Sehee Kim"
            className="fixed inset-0 z-10003 flex items-center justify-center invisible"
          >
            <div
              ref={overlayCursorCloseRef}
              className="pointer-events-none fixed left-0 top-0 z-20 hidden [@media(hover:hover)]:block text-xs uppercase tracking-[0.2em] text-foreground/90 opacity-0"
              aria-hidden="true"
            >
              Close
            </div>

            <div
              data-about-overlay-backdrop
              className="absolute inset-0 bg-background/85 backdrop-blur-md cursor-pointer"
              onClick={closePreview}
              aria-hidden="true"
            />

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closePreview}
              className="absolute right-4 top-4 z-10 p-2 text-foreground group"
              aria-label="Close preview"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
              <HiOutlineX className="size-6 relative z-10" aria-hidden />
            </button>

            <div
              ref={previewImageContainerRef}
              data-about-preview-image
              className="relative z-10 overflow-hidden rounded-xl"
              style={{
                width: "min(85vw, 900px)",
                aspectRatio: `${ABOUT_PORTRAIT_WIDTH} / ${ABOUT_PORTRAIT_HEIGHT}`,
              }}
            >
              <Skeleton className="absolute inset-0 rounded-xl" />
              <Image
                fill
                src={ABOUT_PORTRAIT_SRC}
                alt="Portrait of Sehee Kim"
                priority
                sizes="min(85vw, 900px)"
                className={cn(
                  "relative z-10 object-cover transition-opacity duration-300",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={handleImageLoad}
              />
            </div>
          </div>,
          previewPortalTarget,
        )
      : null;

  return (
    <>
      <section
        ref={containerRef}
        className="min-h-[calc(100svh-3.5rem)] flex flex-col max-w-7xl mx-auto px-8 md:px-12 lg:px-16 pb-10 lg:pb-14 invisible"
      >
        {/* Heading */}
        <div className="flex-1 flex items-center justify-center py-16 md:py-20">
          <h1
            ref={headingRef}
            className="font-cormorant font-bold uppercase text-center leading-[1.05] tracking-[.1vw] text-[clamp(2.2rem,4vw,4rem)] overflow-visible"
          >
            <span
              ref={nameRef}
              className="photographer-name about-name-link cursor-pointer"
              data-about-name
            >
              {ABOUT_NAME}
            </span>{" "}
            {ABOUT_BIO_REST}
            {/* <span>{ABOUT_BIO_REST}</span> */}
          </h1>
        </div>

        {/* Hover preview — follows cursor */}
        <div
          ref={namePreviewRef}
          className="about-name-preview pointer-events-none fixed left-0 top-0 z-50 hidden [@media(hover:hover)]:block rounded-sm"
          aria-hidden="true"
        >
          <Image
            src={ABOUT_PORTRAIT_SRC}
            alt="Portrait of Sehee Kim"
            width={220}
            height={146}
            className="h-auto w-[220px] rounded-sm object-cover"
          />
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
              {ABOUT_CLIENTS.map((client) => (
                <li
                  key={client}
                  data-client-item
                  className={cn(
                    "font-dm text-sm uppercase tracking-wide text-foreground font-medium",
                    client === "Rockefeller Center" && "col-span-2"
                  )}
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
              <AnimatedAboutLink
                href={`mailto:${ABOUT_CONTACT.email}`}
                label={ABOUT_CONTACT.email}
              />
              <AnimatedAboutLink
                href={ABOUT_CONTACT.phone.href}
                label={ABOUT_CONTACT.phone.label}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm"
              />
              <AnimatedAboutLink
                href={ABOUT_CONTACT.instagram.href}
                label={ABOUT_CONTACT.instagram.label}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm"
              />
              {/* <AnimatedAboutLink
                href={ABOUT_CONTACT.siteCredits.href}
                label={ABOUT_CONTACT.siteCredits.label}
                className="font-dm"
              /> */}
            </div>
          </div>
        </div>
      </section>

      {previewOverlay}
    </>
  );
}
