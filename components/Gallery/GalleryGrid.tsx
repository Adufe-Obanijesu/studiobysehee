"use client";

import { memo } from "react";
import type { MutableRefObject, RefObject } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryGridItem } from "./GalleryGridItem";
import type { GalleryImage } from "./types";

type GalleryGridProps = {
  columns: GalleryImage[][];
  columnVirtuosoRefs: MutableRefObject<(VirtuosoHandle | null)[]>;
  registerFigureRef: (id: number) => (el: HTMLElement | null) => void;
  openFromImageId: (id: number) => void;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  initialSkeletonsPerColumn: number;
  loadingMoreSkeletonsPerColumn: number;
  defaultItemHeight: number;
  initialItemsPerColumn: number;
  skeletonAspectRatios: readonly number[];
  sentinelRef: RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  totalImages: number;
};

export const GalleryGrid = memo(function GalleryGrid({
  columns,
  columnVirtuosoRefs,
  registerFigureRef,
  openFromImageId,
  isInitialLoading,
  isLoadingMore,
  initialSkeletonsPerColumn,
  loadingMoreSkeletonsPerColumn,
  defaultItemHeight,
  initialItemsPerColumn,
  skeletonAspectRatios,
  sentinelRef,
  hasMore,
  totalImages,
}: GalleryGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {columns.map((columnImages, columnIndex) => (
          <div key={`column-${columnIndex}`}>
            {isInitialLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: initialSkeletonsPerColumn }, (_, index) => (
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
                ))}
              </div>
            ) : (
              <Virtuoso
                ref={(el) => {
                  columnVirtuosoRefs.current[columnIndex] = el;
                }}
                useWindowScroll
                totalCount={
                  columnImages.length +
                  (isLoadingMore ? loadingMoreSkeletonsPerColumn : 0)
                }
                defaultItemHeight={defaultItemHeight}
                initialItemCount={Math.min(initialItemsPerColumn, columnImages.length)}
                overscan={200}
                itemContent={(index) => {
                  const image = columnImages[index];
                  return (
                    <div className="pb-4">
                      {image ? (
                        <GalleryGridItem
                          image={image}
                          registerFigureRef={registerFigureRef}
                          openFromImageId={openFromImageId}
                        />
                      ) : (
                        <Skeleton
                          className="w-full rounded-xl"
                          style={{
                            aspectRatio:
                              skeletonAspectRatios[
                                (columnIndex + (index - columnImages.length)) %
                                  skeletonAspectRatios.length
                              ],
                          }}
                        />
                      )}
                    </div>
                  );
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 w-full" />

      {!hasMore && totalImages > 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          You reached the end.
        </p>
      ) : null}
    </>
  );
});
