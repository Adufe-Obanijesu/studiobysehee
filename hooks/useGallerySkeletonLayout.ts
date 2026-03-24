"use client";

import { useEffect, useMemo, useState } from "react";

type Params = {
  columnCount: number;
};

const SKELETON_ASPECT_RATIOS = [0.75, 1.2, 0.9];
const GALLERY_GAP_PX = 16;
const MOBILE_SIDE_PADDING_PX = 16;
const DESKTOP_SIDE_PADDING_PX = 24;

const getSidePadding = (width: number) => {
  return width >= 768 ? DESKTOP_SIDE_PADDING_PX : MOBILE_SIDE_PADDING_PX;
};

export function useGallerySkeletonLayout({ columnCount }: Params) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const layout = useMemo(() => {
    const safeColumnCount = Math.max(1, columnCount);
    const safeViewportWidth = Math.max(320, viewportWidth || 320);
    const safeViewportHeight = Math.max(640, viewportHeight || 640);
    const sidePadding = getSidePadding(safeViewportWidth);
    const contentWidth = Math.max(320, safeViewportWidth - sidePadding * 2);
    const columnWidth =
      (contentWidth - GALLERY_GAP_PX * (safeColumnCount - 1)) / safeColumnCount;
    const averageAspectRatio =
      SKELETON_ASPECT_RATIOS.reduce((sum, ratio) => sum + ratio, 0) /
      SKELETON_ASPECT_RATIOS.length;
    const estimatedSkeletonHeight = Math.max(120, columnWidth / averageAspectRatio);
    const estimatedItemHeight = estimatedSkeletonHeight + GALLERY_GAP_PX;
    const rowsToOverflowViewport = Math.ceil(
      (safeViewportHeight * 1.35) / estimatedItemHeight,
    );
    const initialSkeletonsPerColumn = Math.max(4, rowsToOverflowViewport);
    const loadingMoreSkeletonsPerColumn = Math.max(
      1,
      Math.min(3, Math.ceil(initialSkeletonsPerColumn * 0.34)),
    );
    const initialItemsPerColumn = Math.max(4, Math.ceil(rowsToOverflowViewport * 1.1));

    return {
      initialSkeletonsPerColumn,
      loadingMoreSkeletonsPerColumn,
      estimatedItemHeight,
      initialItemsPerColumn,
      skeletonAspectRatios: SKELETON_ASPECT_RATIOS,
    };
  }, [columnCount, viewportHeight, viewportWidth]);

  return layout;
}
