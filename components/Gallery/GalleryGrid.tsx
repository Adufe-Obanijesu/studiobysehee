"use client";

import { memo } from "react";
import type { ComponentType } from "react";
import { Masonry } from "masonic";
import type { RenderComponentProps } from "masonic";
import { Skeleton } from "@/components/ui/skeleton";
import type { GalleryImage } from "./types";

type GalleryGridProps = {
  images: GalleryImage[];
  columnCount: number;
  columnsReady: boolean;
  masonryScrollToIndex: number | undefined;
  renderMasonryItem: ComponentType<RenderComponentProps<GalleryImage>>;
  onMasonryRender: (startIndex: number, stopIndex: number, items: GalleryImage[]) => void;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  initialSkeletonsPerColumn: number;
  loadingMoreSkeletonsPerColumn: number;
  skeletonAspectRatios: readonly number[];
  hasMore: boolean;
  totalImages: number;
};

export const GalleryGrid = memo(function GalleryGrid({
  images,
  columnCount,
  columnsReady,
  masonryScrollToIndex,
  renderMasonryItem,
  onMasonryRender,
  isInitialLoading,
  isLoadingMore,
  initialSkeletonsPerColumn,
  loadingMoreSkeletonsPerColumn,
  skeletonAspectRatios,
  hasMore,
  totalImages,
}: GalleryGridProps) {
  if (!columnsReady) {
    return (
      <div
        className="w-full"
        aria-busy
        aria-label="Preparing gallery layout"
      />
    );
  }

  if (isInitialLoading) {
    return (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, columnCount)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: Math.max(1, columnCount) }, (_, columnIndex) => (
          <div key={`gallery-initial-column-${columnIndex}`} className="flex flex-col gap-4">
            {Array.from({ length: initialSkeletonsPerColumn }, (_, index) => (
              <Skeleton
                key={`gallery-initial-skeleton-${columnIndex}-${index}`}
                className="w-full rounded-xl"
                style={{
                  aspectRatio:
                    skeletonAspectRatios[(columnIndex + index) % skeletonAspectRatios.length],
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <Masonry<GalleryImage>
        items={images}
        render={renderMasonryItem}
        role="list"
        columnGutter={16}
        rowGutter={16}
        columnCount={Math.max(1, columnCount)}
        itemKey={(data) => data.id}
        onRender={onMasonryRender}
        scrollToIndex={
          masonryScrollToIndex === undefined
            ? undefined
            : { index: masonryScrollToIndex, align: "center" as const }
        }
        overscanBy={2}
      />

      {isLoadingMore ? (
        <div
          className="mt-4 grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, columnCount)}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: Math.max(1, columnCount) * loadingMoreSkeletonsPerColumn }, (_, index) => (
            <Skeleton
              key={`gallery-load-more-skeleton-${index}`}
              className="w-full rounded-xl"
              style={{
                aspectRatio:
                  skeletonAspectRatios[
                    (index + initialSkeletonsPerColumn * columnCount) % skeletonAspectRatios.length
                  ],
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
});
