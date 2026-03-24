"use client";

import { GalleryLightbox } from "./GalleryLightbox";
import { GalleryGrid } from "./GalleryGrid";
import { useGalleryFocus } from "@/hooks/useGalleryFocus";
import { useGalleryViewportPresence } from "@/hooks/useGalleryViewportPresence";
import { useGalleryMasonry } from "@/hooks/useGalleryMasonry";
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

  const { columns, columnCount, columnVirtuosoRefs, sentinelRef, scrollToIndex } =
    useGalleryMasonry({ images, hasMore, isFetchingMore, loadMore });

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

  const {
    initialSkeletonsPerColumn,
    loadingMoreSkeletonsPerColumn,
    estimatedItemHeight,
    initialItemsPerColumn,
    skeletonAspectRatios,
  } = useGallerySkeletonLayout({ columnCount });

  const isInitialLoading = images.length === 0;
  const isLoadingMore = isFetchingMore && images.length > 0;

  return (
    <section className="w-full px-4 py-4 md:px-6">
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

      <GalleryGrid
        columns={columns}
        columnVirtuosoRefs={columnVirtuosoRefs}
        registerFigureRef={registerFigureRef}
        openFromImageId={openFromImageId}
        isInitialLoading={isInitialLoading}
        isLoadingMore={isLoadingMore}
        initialSkeletonsPerColumn={initialSkeletonsPerColumn}
        loadingMoreSkeletonsPerColumn={loadingMoreSkeletonsPerColumn}
        defaultItemHeight={estimatedItemHeight}
        initialItemsPerColumn={initialItemsPerColumn}
        skeletonAspectRatios={skeletonAspectRatios}
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        totalImages={images.length}
      />
    </section>
  );
}
