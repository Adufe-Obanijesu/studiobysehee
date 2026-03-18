"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryImageLoading } from "@/hooks/useGalleryImageLoading";
import { useGalleryMasonry } from "@/hooks/useGalleryMasonry";
import { useGalleryVirtualization } from "@/hooks/useGalleryVirtualization";
import type { GalleryProps } from "./types";

export default function Gallery({
  images,
  isLoading,
  isFetchingMore,
  hasMore,
  loadMore,
}: GalleryProps) {
  const { containerRef, visibleImages, topSpacerHeight, bottomSpacerHeight } =
    useGalleryVirtualization(images);

  const { sentinelRef, columns } = useGalleryMasonry({
    images: visibleImages,
    hasMore,
    isFetchingMore,
    loadMore,
  });
  const { isImageLoaded, markImageLoaded } = useGalleryImageLoading(visibleImages);
  const isInitialLoading = isLoading && visibleImages.length === 0;
  const isLoadingMore = isFetchingMore && visibleImages.length > 0;
  const initialSkeletonsPerColumn = 3;
  const loadingMoreSkeletonsPerColumn = 1;
  const skeletonAspectRatios = [0.75, 1.2, 0.9];

  return (
    <section ref={containerRef} className="w-full px-4 py-4 md:px-6">
      <div>
        {topSpacerHeight > 0 ? (
          <div aria-hidden className="w-full" style={{ height: topSpacerHeight }} />
        ) : null}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {columns.map((column, columnIndex) => (
            <div key={`column-${columnIndex}`} className="flex flex-col gap-4">
              {column.map((image) => (
                <article key={image.id} className="relative overflow-hidden rounded-xl bg-muted/20">
                  <Skeleton className="pointer-events-none absolute inset-0 z-0 rounded-none" />
                  <Image
                    src={image.src}
                    alt={image.alt || "Gallery image"}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                    className={`relative z-10 h-auto w-full object-cover transition-opacity duration-300 ${
                      isImageLoaded(image.id) ? "opacity-100" : "opacity-0"
                    }`}
                    loading="lazy"
                    onLoad={() => {
                      markImageLoaded(image.id);
                    }}
                  />
                </article>
              ))}

              {isInitialLoading
                ? Array.from({ length: initialSkeletonsPerColumn }, (_, index) => (
                    <Skeleton
                      key={`gallery-initial-skeleton-${columnIndex}-${index}`}
                      className="w-full rounded-xl"
                      style={{
                        aspectRatio: skeletonAspectRatios[(columnIndex + index) % skeletonAspectRatios.length],
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
                            (columnIndex + index + initialSkeletonsPerColumn) % skeletonAspectRatios.length
                          ],
                      }}
                    />
                  ))
                : null}
            </div>
          ))}
        </div>

        {bottomSpacerHeight > 0 ? (
          <div aria-hidden className="w-full" style={{ height: bottomSpacerHeight }} />
        ) : null}

        <div ref={sentinelRef} className="h-10 w-full" />

        {!hasMore && images.length > 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">You reached the end.</p>
        ) : null}
      </div>
    </section>
  );
}
