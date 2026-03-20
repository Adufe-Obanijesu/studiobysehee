"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { HiOutlineX } from "react-icons/hi";
import type { GalleryImage } from "./types";

export type GalleryLightboxProps = {
  isOpen: boolean;
  activeImage: GalleryImage | null;
  onClose: () => void;
  backdropRef: RefObject<HTMLDivElement | null>;
  contentWrapperRef: RefObject<HTMLDivElement | null>;
  isLightboxImageLoaded: boolean;
  lightboxSizes: string;
  onImageLoad: () => void;
};

export function GalleryLightbox({
  isOpen,
  activeImage,
  onClose,
  backdropRef,
  contentWrapperRef,
  isLightboxImageLoaded,
  lightboxSizes,
  onImageLoad,
}: GalleryLightboxProps) {
  if (!isOpen || !activeImage) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10000"
      role="dialog"
      aria-modal="true"
      aria-label="Image focus"
    >
      {/* Backdrop: fades in independently, click closes lightbox */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 bg-background/95 backdrop-blur-sm"
      />

      {/* Close button: always above backdrop and content */}
      <button
        type="button"
        onClick={onClose}
        className="pointer-events-auto absolute right-4 top-4 z-10001 rounded-md p-2 text-foreground transition-colors hover:bg-muted"
        aria-label="Close"
      >
        <HiOutlineX className="size-6" aria-hidden />
      </button>

      {/* Content wrapper: scales up from the clicked image's origin */}
      <div
        ref={contentWrapperRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-16"
      >
        <div
          className="pointer-events-auto relative overflow-hidden rounded-xl"
          style={{
            width: `min(100%, calc(85dvh * (${activeImage.width} / ${activeImage.height})), 64rem)`,
            aspectRatio: `${activeImage.width} / ${activeImage.height}`,
            maxHeight: "85dvh",
          }}
        >
          <Skeleton className="absolute inset-0 rounded-xl" />
          <Image
            fill
            src={activeImage.src}
            alt={activeImage.alt || "Gallery image"}
            className={`relative z-10 object-contain transition-opacity duration-300 ${
              isLightboxImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes={lightboxSizes}
            priority
            onLoad={onImageLoad}
          />
        </div>
      </div>
    </div>
  );
}
