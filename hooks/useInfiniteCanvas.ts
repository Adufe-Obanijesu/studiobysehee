"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import people from "@/data/people.json";

gsap.registerPlugin(useGSAP);

type PersonImage = {
  src: string;
  alt: string;
  naturalWidth: number;
  naturalHeight: number;
};

type CanvasSlot = {
  x: number;
  y: number;
  visible: boolean;
};

const COLUMN_COUNT = 5;
const GAP = 20;
const CELL_HEIGHT = 320;
const COLUMN_OFFSETS = [0, -120, 60, -40, 80] as const;
const ROW_BUFFER = 1;
const HORIZONTAL_OVERSCAN = 120;
const RESIZE_DEBOUNCE_MS = 150;

type GeometrySnapshot = {
  columns: number;
  cellWidth: number;
  cellHeight: number;
  activePoolSize: number;
  slots: CanvasSlot[];
};

export function useInfiniteCanvas() {
  const scopeRef = useRef<HTMLElement | null>(null);
  const poolRefs = useRef<Array<HTMLDivElement | null>>([]);
  const resizeTimerRef = useRef<number | null>(null);
  const geometryRef = useRef<GeometrySnapshot>({
    columns: COLUMN_COUNT,
    cellWidth: 0,
    cellHeight: CELL_HEIGHT,
    activePoolSize: 0,
    slots: [],
  });
  const hasPlayedEntranceRef = useRef(false);
  const poolSizeRef = useRef(0);
  const [poolSize, setPoolSize] = useState(0);
  const imageData = useMemo(() => people as PersonImage[], []);

  const applyLayoutToPool = useCallback((poolCount: number) => {
    const geometry = geometryRef.current;
    const nodes = poolRefs.current.slice(0, poolCount);

    nodes.forEach((node, index) => {
      if (!node) {
        return;
      }

      const slot = geometry.slots[index];
      const fallbackColumn = index % geometry.columns;
      const fallbackRow = Math.floor(index / geometry.columns) - ROW_BUFFER;
      const fallbackX = -HORIZONTAL_OVERSCAN + fallbackColumn * (geometry.cellWidth + GAP);
      const fallbackY = fallbackRow * (CELL_HEIGHT + GAP) + COLUMN_OFFSETS[fallbackColumn];
      const isVisible = slot?.visible ?? false;
      const image = imageData.length > 0 ? imageData[index % imageData.length] : null;
      const imageNode = node.querySelector("img");

      if (imageNode && image) {
        if (imageNode.getAttribute("src") !== image.src) {
          imageNode.classList.add("opacity-0");
          imageNode.classList.remove("opacity-100");
          imageNode.setAttribute("src", image.src);
        }

        imageNode.setAttribute("alt", image.alt || "Studio by Sehee photo");
        imageNode.setAttribute("width", String(image.naturalWidth));
        imageNode.setAttribute("height", String(image.naturalHeight));
      }

      gsap.set(node, {
        x: slot?.x ?? fallbackX,
        y: slot?.y ?? fallbackY,
        width: geometry.cellWidth,
        height: geometry.cellHeight,
        visibility: isVisible ? "visible" : "hidden",
        force3D: true,
      });
    });
  }, [imageData]);

  const computeGeometry = useCallback((containerWidth: number, containerHeight: number) => {
    if (containerWidth <= 0 || containerHeight <= 0) {
      return;
    }

    const columns = COLUMN_COUNT;
    const cellWidth = Math.max(
      180,
      Math.round((containerWidth + HORIZONTAL_OVERSCAN * 2 - GAP * (columns - 1)) / columns),
    );
    const rowStep = CELL_HEIGHT + GAP;
    const minOffset = Math.min(...COLUMN_OFFSETS);
    const maxOffset = Math.max(...COLUMN_OFFSETS);
    const visibleRows = Math.ceil((containerHeight + Math.abs(minOffset) + maxOffset) / rowStep);
    const totalRows = visibleRows + ROW_BUFFER * 2;
    const activePoolSize = columns * totalRows;
    const startX = -HORIZONTAL_OVERSCAN;
    const firstRow = -ROW_BUFFER;

    const slots: CanvasSlot[] = [];
    for (let row = 0; row < totalRows; row += 1) {
      const rowIndex = firstRow + row;

      for (let column = 0; column < columns; column += 1) {
        slots.push({
          x: startX + column * (cellWidth + GAP),
          y: rowIndex * rowStep + COLUMN_OFFSETS[column],
          visible: true,
        });
      }
    }

    geometryRef.current = {
      columns,
      cellWidth,
      cellHeight: CELL_HEIGHT,
      activePoolSize,
      slots,
    };

    const currentPoolSize = poolSizeRef.current;
    const nextPoolSize = Math.max(currentPoolSize, activePoolSize);
    if (nextPoolSize !== currentPoolSize) {
      poolSizeRef.current = nextPoolSize;
      setPoolSize(nextPoolSize);
      return;
    }

    applyLayoutToPool(nextPoolSize);
  }, [applyLayoutToPool]);

  useGSAP(
    () => {
      if (poolSize === 0) {
        return;
      }

      applyLayoutToPool(poolSize);

      const activePoolSize = geometryRef.current.activePoolSize;
      if (hasPlayedEntranceRef.current || activePoolSize === 0) {
        return;
      }

      const cells = poolRefs.current.slice(0, activePoolSize).filter(Boolean) as HTMLDivElement[];
      if (cells.length === 0) {
        return;
      }

      gsap.fromTo(
        cells,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.03,
          overwrite: "auto",
        },
      );

      hasPlayedEntranceRef.current = true;
    },
    { scope: scopeRef, dependencies: [poolSize] },
  );

  const setCellRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      poolRefs.current[index] = node;
    },
    [],
  );

  const onImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.classList.remove("opacity-0");
    event.currentTarget.classList.add("opacity-100");
  }, []);

  useEffect(() => {
    poolSizeRef.current = poolSize;
  }, [poolSize]);

  useEffect(() => {
    const container = scopeRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
      }

      resizeTimerRef.current = window.setTimeout(() => {
        computeGeometry(width, height);
      }, RESIZE_DEBOUNCE_MS);
    });

    observer.observe(container);
    const rect = container.getBoundingClientRect();
    computeGeometry(rect.width, rect.height);

    return () => {
      observer.disconnect();
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
      }
    };
  }, [computeGeometry]);

  const pool = useMemo(() => Array.from({ length: poolSize }, (_, index) => index), [poolSize]);

  return {
    scopeRef,
    pool,
    setCellRef,
    onImageLoad,
  };
}
