"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { HiOutlineX, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { getGalleryPlaceholderClass } from "./getGalleryPlaceholderClass";
import type { GalleryImage } from "./types";

export type GalleryLightboxProps = {
  isOpen: boolean;
  activeImage: GalleryImage | null;
  onClose: () => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp: React.PointerEventHandler<HTMLDivElement>;
  onPointerCancel: React.PointerEventHandler<HTMLDivElement>;
  backdropRef: RefObject<HTMLDivElement | null>;
  contentWrapperRef: RefObject<HTMLDivElement | null>;
  captionMaskRef: RefObject<HTMLDivElement | null>;
  captionTextRef: RefObject<HTMLParagraphElement | null>;
  isLightboxImageLoaded: boolean;
  isLightboxImageFailed: boolean;
  lightboxSizes: string;
  onImageLoad: () => void;
  onImageError: () => void;
};

export function GalleryLightbox({
  isOpen,
  activeImage,
  onClose,
  canNavigatePrev,
  canNavigateNext,
  onNavigatePrev,
  onNavigateNext,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  backdropRef,
  contentWrapperRef,
  captionMaskRef,
  captionTextRef,
  isLightboxImageLoaded,
  isLightboxImageFailed,
  lightboxSizes,
  onImageLoad,
  onImageError,
}: GalleryLightboxProps) {
  if (!isOpen || !activeImage) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10000 touch-none"
      role="dialog"
      aria-modal="true"
      aria-label="Image focus"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Backdrop: fades in independently, tap-to-close handled by pointer events */}
      <div
        ref={backdropRef}
        className="pointer-events-auto absolute inset-0 bg-background/95 backdrop-blur-sm"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        data-lightbox-control="true"
        className="pointer-events-auto absolute right-4 top-4 z-10001 rounded-full p-2 text-foreground group"
        aria-label="Close"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <HiOutlineX className="size-6 relative z-10" aria-hidden />
      </button>

      {/* Prev arrow */}
      <button
        type="button"
        onClick={onNavigatePrev}
        data-lightbox-control="true"
        className={cn(
          "pointer-events-auto absolute left-4 top-1/2 z-10001 -translate-y-1/2 rounded-full p-2 text-foreground group",
          !canNavigatePrev && "pointer-events-none opacity-0",
        )}
        aria-label="Previous image"
        tabIndex={canNavigatePrev ? 0 : -1}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <HiChevronLeft className="size-7 relative z-10" aria-hidden />
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={onNavigateNext}
        data-lightbox-control="true"
        className={cn(
          "pointer-events-auto absolute right-4 top-1/2 z-10001 -translate-y-1/2 rounded-full p-2 text-foreground group",
          !canNavigateNext && "pointer-events-none opacity-0",
        )}
        aria-label="Next image"
        tabIndex={canNavigateNext ? 0 : -1}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-muted group-hover:scale-100 scale-0 transition-transform transition-ease-200 rounded-full" />
        <HiChevronRight className="size-7 relative z-10" aria-hidden />
      </button>

      {/* Content wrapper: scales up from the clicked image's origin */}
      <div
        ref={contentWrapperRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-16"
      >
        <div
          className="pointer-events-auto flex flex-col gap-3"
          style={{
            width: `min(100%, calc(85dvh * (${activeImage.width} / ${activeImage.height})), 64rem)`,
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              aspectRatio: `${activeImage.width} / ${activeImage.height}`,
              maxHeight: "85dvh",
            }}
          >
            {!isLightboxImageFailed && (
              <Skeleton className="absolute inset-0 rounded-xl" />
            )}
            {isLightboxImageFailed && (
              <div
                className={`absolute inset-0 rounded-xl ${getGalleryPlaceholderClass(activeImage.id)}`}
              />
            )}
            <Image
              fill
              src={activeImage.src}
              alt={activeImage.alt || "Gallery image"}
              className={`relative z-10 object-contain transition-opacity duration-300 ${
                isLightboxImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes={lightboxSizes}
              priority
              unoptimized
              loading="eager"
              onLoad={onImageLoad}
              onError={onImageError}
            />
          </div>
          <div ref={captionMaskRef} className="overflow-hidden">
            <p
              ref={captionTextRef}
              className="text-sm text-foreground/90 md:text-base text-center"
            >
              {activeImage.alt || "Gallery image"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
