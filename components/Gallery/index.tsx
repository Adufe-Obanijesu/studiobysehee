"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import { GalleryLightbox } from "./GalleryLightbox";
import { GalleryGrid } from "./GalleryGrid";
import { useGalleryFocus } from "@/hooks/useGalleryFocus";
import { useGalleryViewportPresence } from "@/hooks/useGalleryViewportPresence";
import { useGalleryImageLoading } from "@/hooks/useGalleryImageLoading";
import { useGalleryMasonry } from "@/hooks/useGalleryMasonry";
import { useGalleryMasonryItemRenderer } from "@/hooks/useGalleryMasonryItemRenderer";
import { useGallerySkeletonLayout } from "@/hooks/useGallerySkeletonLayout";
import { useGalleryLightboxPortalTarget } from "@/hooks/useGalleryLightboxPortalTarget";
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
    columnCount,
    columnsReady,
    scrollToIndex,
    masonryScrollToIndex,
    onMasonryRender,
  } = useGalleryMasonry({
    images,
    hasMore,
    isFetchingMore,
    loadMore,
  });

  const { isImageLoaded, markImageLoaded: markGridImageLoaded } =
    useGalleryImageLoading(images);

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
    notifyGridImageLoaded,
  } = useGalleryFocus({
    images,
    getFigureElement,
    isImageLoaded,
    hasMore,
    isFetchingMore,
    loadMore,
    scrollToIndex,
  });

  const markImageLoaded = useCallback(
    (id: number) => {
      markGridImageLoaded(id);
      notifyGridImageLoaded(id);
    },
    [markGridImageLoaded, notifyGridImageLoaded],
  );

  const renderMasonryItem = useGalleryMasonryItemRenderer({
    isImageLoaded,
    markImageLoaded,
    registerFigureRef,
    openFromImageId,
  });

  const { initialSkeletonsPerColumn, loadingMoreSkeletonsPerColumn, skeletonAspectRatios } =
    useGallerySkeletonLayout({
      columnCount,
    });
  const isInitialLoading = isLoading && images.length === 0;
  const isLoadingMore = isFetchingMore && images.length > 0;

  const lightboxPortalTarget = useGalleryLightboxPortalTarget();

  return (
    <section className="min-h-[calc(100dvh-3.5rem)] w-full px-4 py-4 md:px-6">
      {lightboxPortalTarget != null &&
        createPortal(
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
          />,
          lightboxPortalTarget,
        )}

      <GalleryGrid
        images={images}
        columnCount={columnCount}
        columnsReady={columnsReady}
        masonryScrollToIndex={masonryScrollToIndex}
        renderMasonryItem={renderMasonryItem}
        onMasonryRender={onMasonryRender}
        isInitialLoading={isInitialLoading}
        isLoadingMore={isLoadingMore}
        initialSkeletonsPerColumn={initialSkeletonsPerColumn}
        loadingMoreSkeletonsPerColumn={loadingMoreSkeletonsPerColumn}
        skeletonAspectRatios={skeletonAspectRatios}
        hasMore={hasMore}
        totalImages={images.length}
      />
    </section>
  );
}
