"use client";

import { GalleryLightbox } from "./GalleryLightbox";
import { GalleryGrid } from "./GalleryGrid";
import { useGalleryFocus } from "@/hooks/useGalleryFocus";
import { useGalleryImageLoading } from "@/hooks/useGalleryImageLoading";
import { useGalleryViewportPresence } from "@/hooks/useGalleryViewportPresence";
import { useGalleryMasonry } from "@/hooks/useGalleryMasonry";
import { useGalleryVirtualization } from "@/hooks/useGalleryVirtualization";
import { useGallerySkeletonLayout } from "@/hooks/useGallerySkeletonLayout";
import type { GalleryProps } from "./types";

export default function Gallery({
  images,
  isLoading,
  isFetchingMore,
  hasMore,
  loadMore,
}: GalleryProps) {
  const { registerFigureRef, getFigureElement } = useGalleryViewportPresence();

  const { containerRef, visibleImages, topSpacerHeight, bottomSpacerHeight, scrollToIndex } =
    useGalleryVirtualization(images);

  const { isImageLoaded, markImageLoaded } = useGalleryImageLoading(visibleImages);

  const {
    isOpen,
    activeImage,
    canNavigatePrev,
    canNavigateNext,
    isLightboxImageLoaded,
    lightboxSizes,
    markLightboxImageLoaded,
    backdropRef,
    contentWrapperRef,
    captionMaskRef,
    captionTextRef,
    openFromImageId,
    navigatePrev,
    navigateNext,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    close,
  } = useGalleryFocus({
    images,
    getFigureElement,
    hasMore,
    isFetchingMore,
    loadMore,
    scrollToIndex,
  });

  const { sentinelRef, columns } = useGalleryMasonry({
    images: visibleImages,
    hasMore,
    isFetchingMore,
    loadMore,
  });
  const { initialSkeletonsPerColumn, loadingMoreSkeletonsPerColumn, skeletonAspectRatios } =
    useGallerySkeletonLayout({
      columnCount: columns.length,
    });
  const isInitialLoading = isLoading && visibleImages.length === 0;
  const isLoadingMore = isFetchingMore && visibleImages.length > 0;

  return (
    <section ref={containerRef} className="w-full px-4 py-4 md:px-6">
      <GalleryLightbox
        isOpen={isOpen}
        activeImage={activeImage}
        onClose={close}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        onNavigatePrev={navigatePrev}
        onNavigateNext={navigateNext}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        backdropRef={backdropRef}
        contentWrapperRef={contentWrapperRef}
        captionMaskRef={captionMaskRef}
        captionTextRef={captionTextRef}
        isLightboxImageLoaded={isLightboxImageLoaded}
        lightboxSizes={lightboxSizes}
        onImageLoad={markLightboxImageLoaded}
      />

      <div>
        {topSpacerHeight > 0 ? (
          <div aria-hidden className="w-full" style={{ height: topSpacerHeight }} />
        ) : null}

        <GalleryGrid
          columns={columns}
          isImageLoaded={isImageLoaded}
          markImageLoaded={markImageLoaded}
          registerFigureRef={registerFigureRef}
          openFromImageId={openFromImageId}
          isInitialLoading={isInitialLoading}
          isLoadingMore={isLoadingMore}
          initialSkeletonsPerColumn={initialSkeletonsPerColumn}
          loadingMoreSkeletonsPerColumn={loadingMoreSkeletonsPerColumn}
          skeletonAspectRatios={skeletonAspectRatios}
          sentinelRef={sentinelRef}
          hasMore={hasMore}
          totalImages={images.length}
        />

        {bottomSpacerHeight > 0 ? (
          <div aria-hidden className="w-full" style={{ height: bottomSpacerHeight }} />
        ) : null}
      </div>
    </section>
  );
}
