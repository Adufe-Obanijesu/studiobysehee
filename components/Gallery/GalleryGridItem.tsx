"use client";

import { memo } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryGridItem } from "@/hooks/useGalleryGridItem";
import { GALLERY_GRID_IMAGE_SIZES } from "./constants";
import type { GalleryImage } from "./types";

type GalleryGridItemProps = {
  image: GalleryImage;
  registerFigureRef: (id: number) => (el: HTMLElement | null) => void;
  openFromImageId: (id: number) => void;
};

export const GalleryGridItem = memo(function GalleryGridItem({
  image,
  registerFigureRef,
  openFromImageId,
}: GalleryGridItemProps) {
  const { isLoaded, handleImageLoad } = useGalleryGridItem();

  return (
    <figure
      ref={registerFigureRef(image.id)}
      className="relative overflow-hidden rounded-xl bg-muted/20"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 400px" }}
    >
      <Skeleton className="pointer-events-none absolute inset-0 z-0 rounded-none" />
      <Image
        src={image.src}
        alt={image.alt || "Gallery image"}
        width={image.width}
        height={image.height}
        sizes={GALLERY_GRID_IMAGE_SIZES}
        className={`relative z-10 h-auto w-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        decoding="async"
        quality={70}
        onLoad={handleImageLoad}
      />
      <button
        type="button"
        className="absolute inset-0 z-20 cursor-pointer rounded-xl bg-transparent"
        aria-label={`Open image: ${image.alt || "Gallery image"}`}
        onClick={() => openFromImageId(image.id)}
      />
    </figure>
  );
});
