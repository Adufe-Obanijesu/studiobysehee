"use client";

import { useCallback } from "react";
import Image from "next/image";
import type { RenderComponentProps } from "masonic";
import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_GRID_IMAGE_SIZES } from "@/components/Gallery/constants";
import type { GalleryImage } from "@/components/Gallery/types";

type Params = {
  isImageLoaded: (id: number) => boolean;
  isImageFailed: (id: number) => boolean;
  markImageLoaded: (id: number) => void;
  markImageFailed: (id: number) => void;
  registerFigureRef: (id: number) => (el: HTMLElement | null) => void;
  openFromImageId: (id: number) => void;
};

export function useGalleryMasonryItemRenderer({
  isImageLoaded,
  isImageFailed,
  markImageLoaded,
  markImageFailed,
  registerFigureRef,
  openFromImageId,
}: Params) {
  return useCallback(
    ({ data: image }: RenderComponentProps<GalleryImage>) => {
      const imageFailed = isImageFailed(image.id);

      return (
        <figure
          ref={registerFigureRef(image.id)}
          className="group relative overflow-hidden rounded-xl bg-muted/20"
        >
          {!imageFailed && (
            <Skeleton className="pointer-events-none absolute inset-0 z-0 rounded-none" />
          )}
          {imageFailed && (
            <div
              className={`pointer-events-none absolute inset-0 z-10 rounded-none bg-linear-to-br from-rose-200/70 via-orange-200/60 to-amber-200/70`}
            />
          )}
          <Image
            src={image.src}
            alt={image.alt || "Gallery image"}
            width={image.width}
            height={image.height}
            sizes={GALLERY_GRID_IMAGE_SIZES}
            className={`relative z-10 h-auto w-full object-cover ${
              isImageLoaded(image.id) ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => markImageLoaded(image.id)}
            onError={() => markImageFailed(image.id)}
          />
          <div
            className="pointer-events-none absolute inset-0 z-15 rounded-xl bg-black/0 transition-colors duration-300 ease-out group-hover:bg-foreground/35"
            aria-hidden
          />
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-pointer rounded-xl bg-transparent"
            aria-label={`Open image: ${image.alt || "Gallery image"}`}
            onClick={() => openFromImageId(image.id)}
          />
        </figure>
      );
    },
    [
      isImageFailed,
      isImageLoaded,
      markImageFailed,
      markImageLoaded,
      openFromImageId,
      registerFigureRef,
    ],
  );
}
