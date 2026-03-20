"use client";

import { memo } from "react";
import type { RefObject } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_GRID_IMAGE_SIZES } from "./constants";
import type { GalleryImage } from "./types";

type GalleryGridProps = {
  columns: GalleryImage[][];
  isImageLoaded: (id: number) => boolean;
  markImageLoaded: (id: number) => void;
  registerFigureRef: (id: number) => (el: HTMLElement | null) => void;
  openFromImageId: (id: number) => void;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  initialSkeletonsPerColumn: number;
  loadingMoreSkeletonsPerColumn: number;
  skeletonAspectRatios: readonly number[];
  sentinelRef: RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  totalImages: number;
};

export const GalleryGrid = memo(function GalleryGrid({
  columns,
  isImageLoaded,
  markImageLoaded,
  registerFigureRef,
  openFromImageId,
  isInitialLoading,
  isLoadingMore,
  initialSkeletonsPerColumn,
  loadingMoreSkeletonsPerColumn,
  skeletonAspectRatios,
  sentinelRef,
  hasMore,
  totalImages,
}: GalleryGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {columns.map((column, columnIndex) => (
          <div key={`column-${columnIndex}`} className="flex flex-col gap-4">
            {column.map((image) => (
              <figure
                key={image.id}
                ref={registerFigureRef(image.id)}
                className="relative overflow-hidden rounded-xl bg-muted/20"
              >
                <Skeleton className="pointer-events-none absolute inset-0 z-0 rounded-none" />
                <Image
                  src={image.src}
                  alt={image.alt || "Gallery image"}
                  width={image.width}
                  height={image.height}
                  sizes={GALLERY_GRID_IMAGE_SIZES}
                  className={`relative z-10 h-auto w-full object-cover transition-opacity duration-300 ${
                    isImageLoaded(image.id) ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                  onLoad={() => markImageLoaded(image.id)}
                />
                <button
                  type="button"
                  className="absolute inset-0 z-20 cursor-pointer rounded-xl bg-transparent"
                  aria-label={`Open image: ${image.alt || "Gallery image"}`}
                  onClick={() => openFromImageId(image.id)}
                />
              </figure>
            ))}

            {isInitialLoading
              ? Array.from({ length: initialSkeletonsPerColumn }, (_, index) => (
                  <Skeleton
                    key={`gallery-initial-skeleton-${columnIndex}-${index}`}
                    className="w-full rounded-xl"
                    style={{
                      aspectRatio:
                        skeletonAspectRatios[
                          (columnIndex + index) % skeletonAspectRatios.length
                        ],
                    }}
                  />
                ))
              : null}

            {isLoadingMore
              ? Array.from({ length: loadingMoreSkeletonsPerColumn }, (_, index) => (
                  <Skeleton
                    key={`gallery-load-more-skeleton-${columnIndex}-${index}`}
                    className="w-full rounded-xl"
                    style={{
                      aspectRatio:
                        skeletonAspectRatios[
                          (columnIndex + index + initialSkeletonsPerColumn) %
                            skeletonAspectRatios.length
                        ],
                    }}
                  />
                ))
              : null}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 w-full" />

      {!hasMore && totalImages > 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">You reached the end.</p>
      ) : null}
    </>
  );
});
