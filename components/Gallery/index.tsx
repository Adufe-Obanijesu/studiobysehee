"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryLightbox } from "./GalleryLightbox";
import { useGalleryFocus } from "@/hooks/useGalleryFocus";
import { useGalleryImageLoading } from "@/hooks/useGalleryImageLoading";
import { useGalleryViewportPresence } from "@/hooks/useGalleryViewportPresence";
import { useGalleryMasonry } from "@/hooks/useGalleryMasonry";
import { useGalleryVirtualization } from "@/hooks/useGalleryVirtualization";
import { GALLERY_GRID_IMAGE_SIZES } from "./constants";
import type { GalleryProps } from "./types";

export default function Gallery({
  images,
  isLoading,
  isFetchingMore,
  hasMore,
  loadMore,
}: GalleryProps) {
  const { registerFigureRef, getFigureElement } = useGalleryViewportPresence();

  const {
    isOpen,
    activeImage,
    isLightboxImageLoaded,
    lightboxSizes,
    markLightboxImageLoaded,
    backdropRef,
    contentWrapperRef,
    openFromImageId,
    close,
  } = useGalleryFocus({ images, getFigureElement });

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
      <GalleryLightbox
        isOpen={isOpen}
        activeImage={activeImage}
        onClose={close}
        backdropRef={backdropRef}
        contentWrapperRef={contentWrapperRef}
        isLightboxImageLoaded={isLightboxImageLoaded}
        lightboxSizes={lightboxSizes}
        onImageLoad={markLightboxImageLoaded}
      />

      <div>
        {topSpacerHeight > 0 ? (
          <div aria-hidden className="w-full" style={{ height: topSpacerHeight }} />
        ) : null}

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
                    onLoad={() => {
                      markImageLoaded(image.id);
                    }}
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
