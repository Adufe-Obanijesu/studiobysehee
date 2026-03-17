"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  baseX: number;
  baseY: number;
  column: number;
  gridX: number;
  gridY: number;
  imageIndex: number;
  visible: boolean;
};

const TARGET_VISIBLE_COLUMN_COUNT = 5;
const GAP = 20;
const CELL_HEIGHT = 320;
const COLUMN_OFFSETS = [0, -120, 60, -40, 80] as const;
const ROW_BUFFER = 1;
const HORIZONTAL_OVERSCAN = 120;
const RESIZE_DEBOUNCE_MS = 150;

type GeometrySnapshot = {
  columns: number;
  rows: number;
  tileColumns: number;
  tileRows: number;
  cellWidth: number;
  cellHeight: number;
  rowStep: number;
  startX: number;
  firstRow: number;
  containerWidth: number;
  containerHeight: number;
  wrapWidth: number;
  wrapHeight: number;
  activePoolSize: number;
  slots: CanvasSlot[];
};

type VelocitySample = {
  dx: number;
  dy: number;
  dt: number;
};

const getCyclicColumnOffset = (column: number) =>
  COLUMN_OFFSETS[((column % COLUMN_OFFSETS.length) + COLUMN_OFFSETS.length) % COLUMN_OFFSETS.length];

const normalizeModulo = (value: number, modulo: number) =>
  ((value % modulo) + modulo) % modulo;

const getCenterOutOrder = (length: number) => {
  const center = (length - 1) / 2;
  return Array.from({ length }, (_, index) => index).sort((a, b) => {
    const distanceDelta = Math.abs(a - center) - Math.abs(b - center);
    if (distanceDelta !== 0) {
      return distanceDelta;
    }

    return a - b;
  });
};

const getGreatestCommonDivisor = (a: number, b: number) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
};

const getTileDimensions = (totalImages: number, strideColumns: number) => {
  if (totalImages <= 0) {
    return { tileColumns: 1, tileRows: 1 };
  }

  const minColumns = Math.max(1, Math.ceil(Math.sqrt(totalImages)));
  let tileColumns = minColumns;

  // Keep tile columns near-square while avoiding short repeat cycles
  // when global column indices advance by a fixed viewport stride.
  while (getGreatestCommonDivisor(tileColumns, strideColumns) !== 1) {
    tileColumns += 1;
  }

  return {
    tileColumns,
    tileRows: Math.ceil(totalImages / tileColumns),
  };
};

const getImageIndexFromGrid = (
  gridX: number,
  gridY: number,
  tileColumns: number,
  tileRows: number,
  totalImages: number,
) => {
  if (totalImages <= 0) {
    return 0;
  }

  const tileCol = normalizeModulo(gridX, tileColumns);
  const tileRow = normalizeModulo(gridY, tileRows);
  return (tileRow * tileColumns + tileCol) % totalImages;
};

export function useInfiniteCanvas() {
  const scopeRef = useRef<HTMLElement | null>(null);
  const poolRefs = useRef<Array<HTMLDivElement | null>>([]);
  const resizeTimerRef = useRef<number | null>(null);
  const wheelInertiaTimerRef = useRef<number | null>(null);
  const geometryRef = useRef<GeometrySnapshot>({
    columns: TARGET_VISIBLE_COLUMN_COUNT,
    rows: 0,
    tileColumns: 1,
    tileRows: 1,
    cellWidth: 0,
    cellHeight: CELL_HEIGHT,
    rowStep: CELL_HEIGHT + GAP,
    startX: -HORIZONTAL_OVERSCAN,
    firstRow: -ROW_BUFFER,
    containerWidth: 0,
    containerHeight: 0,
    wrapWidth: 0,
    wrapHeight: 0,
    activePoolSize: 0,
    slots: [],
  });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const isDirtyRef = useRef(false);
  const hasPlayedEntranceRef = useRef(false);
  const inertiaProxyRef = useRef({ x: 0, y: 0 });
  const inertiaTweenRef = useRef<gsap.core.Tween | null>(null);
  const pointerStateRef = useRef({
    isDragging: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
  });
  const touchStateRef = useRef({
    isDragging: false,
    touchId: -1,
    lastX: 0,
    lastY: 0,
  });
  const velocitySamplesRef = useRef<VelocitySample[]>([]);
  const poolSizeRef = useRef(0);
  const [poolSize, setPoolSize] = useState(0);
  const imageData = useMemo(() => people as PersonImage[], []);
  const [slotImageIndices, setSlotImageIndices] = useState<number[]>([]);
  const slotImageIndicesRef = useRef<number[]>([]);

  const applySlotImageUpdates = useCallback((updates: Map<number, number>, requiredLength: number) => {
    if (updates.size === 0 && slotImageIndicesRef.current.length >= requiredLength) {
      return;
    }

    setSlotImageIndices((prev) => {
      const nextLength = Math.max(requiredLength, prev.length);
      const next = nextLength === prev.length ? prev.slice() : [...prev, ...Array(nextLength - prev.length).fill(0)];
      let changed = nextLength !== prev.length;

      updates.forEach((imageIndex, slotIndex) => {
        if (next[slotIndex] !== imageIndex) {
          next[slotIndex] = imageIndex;
          changed = true;
        }
      });

      if (!changed) {
        return prev;
      }

      slotImageIndicesRef.current = next;
      return next;
    });
  }, []);

  const applyLayoutToPool = useCallback((poolCount: number) => {
    const geometry = geometryRef.current;
    const nodes = poolRefs.current.slice(0, poolCount);
    const pan = panOffsetRef.current;

    nodes.forEach((node, index) => {
      if (!node) {
        return;
      }

      const slot = geometry.slots[index];
      const fallbackColumn = geometry.columns > 0 ? index % geometry.columns : 0;
      const fallbackRow = geometry.columns > 0 ? Math.floor(index / geometry.columns) - ROW_BUFFER : -ROW_BUFFER;
      const fallbackX = -HORIZONTAL_OVERSCAN + fallbackColumn * (geometry.cellWidth + GAP) + pan.x;
      const fallbackY = fallbackRow * geometry.rowStep + getCyclicColumnOffset(fallbackColumn) + pan.y;
      const isVisible = index < geometry.activePoolSize && (slot?.visible ?? false);

      gsap.set(node, {
        x: (slot?.baseX ?? fallbackX - pan.x) + pan.x,
        y: (slot?.baseY ?? fallbackY - pan.y) + pan.y,
        width: geometry.cellWidth,
        height: geometry.cellHeight,
        visibility: isVisible ? "visible" : "hidden",
        force3D: true,
      });

    });
  }, []);

  const pushVelocitySample = useCallback((dx: number, dy: number, dt: number) => {
    if (dt <= 0) {
      return;
    }

    const samples = velocitySamplesRef.current;
    samples.push({ dx, dy, dt });
    if (samples.length > 5) {
      samples.shift();
    }
  }, []);

  const getAverageVelocity = useCallback(() => {
    const samples = velocitySamplesRef.current;
    if (samples.length === 0) {
      return { vx: 0, vy: 0 };
    }

    const recent = samples.slice(-5);
    const totals = recent.reduce(
      (acc, sample) => {
        acc.dx += sample.dx;
        acc.dy += sample.dy;
        acc.dt += sample.dt;
        return acc;
      },
      { dx: 0, dy: 0, dt: 0 },
    );

    if (totals.dt <= 0) {
      return { vx: 0, vy: 0 };
    }

    return {
      vx: (totals.dx / totals.dt) * 1000,
      vy: (totals.dy / totals.dt) * 1000,
    };
  }, []);

  const killInertia = useCallback(() => {
    if (inertiaTweenRef.current) {
      inertiaTweenRef.current.kill();
      inertiaTweenRef.current = null;
    }

    gsap.killTweensOf(inertiaProxyRef.current);
  }, []);

  const setPanDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const applyPanDelta = useCallback(
    (dx: number, dy: number, dt: number) => {
      if (dx === 0 && dy === 0) {
        return;
      }

      panOffsetRef.current.x += dx;
      panOffsetRef.current.y += dy;
      pushVelocitySample(dx, dy, dt);
      setPanDirty();
    },
    [pushVelocitySample, setPanDirty],
  );

  const startInertia = useCallback(
    (velocityX: number, velocityY: number, duration = 1.35) => {
      if (Math.abs(velocityX) < 5 && Math.abs(velocityY) < 5) {
        return;
      }

      killInertia();

      inertiaProxyRef.current.x = panOffsetRef.current.x;
      inertiaProxyRef.current.y = panOffsetRef.current.y;

      inertiaTweenRef.current = gsap.to(inertiaProxyRef.current, {
        x: panOffsetRef.current.x + velocityX * 0.65,
        y: panOffsetRef.current.y + velocityY * 0.65,
        duration,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          panOffsetRef.current.x = inertiaProxyRef.current.x;
          panOffsetRef.current.y = inertiaProxyRef.current.y;
          setPanDirty();
        },
        onComplete: () => {
          inertiaTweenRef.current = null;
        },
      });
    },
    [killInertia, setPanDirty],
  );

  const processPanFrame = useCallback(() => {
    if (!isDirtyRef.current) {
      return;
    }

    const geometry = geometryRef.current;
    const pan = panOffsetRef.current;
    const activeCount = geometry.activePoolSize;
    if (activeCount === 0 || geometry.columns === 0 || geometry.rows === 0) {
      isDirtyRef.current = false;
      return;
    }

    const minX = -HORIZONTAL_OVERSCAN;
    const maxX = geometry.containerWidth + HORIZONTAL_OVERSCAN;
    const minY = -HORIZONTAL_OVERSCAN;
    const maxY = geometry.containerHeight + HORIZONTAL_OVERSCAN;
    const totalImages = imageData.length;
    const imageUpdates = new Map<number, number>();

    for (let index = 0; index < activeCount; index += 1) {
      const slot = geometry.slots[index];
      const node = poolRefs.current[index];
      if (!slot || !node) {
        continue;
      }

      let wrapped = false;
      let worldX = slot.baseX + pan.x;
      let worldY = slot.baseY + pan.y;

      while (worldX + geometry.cellWidth < minX) {
        slot.gridX += geometry.columns;
        slot.baseX += geometry.wrapWidth;
        wrapped = true;
        worldX = slot.baseX + pan.x;
      }

      while (worldX > maxX) {
        slot.gridX -= geometry.columns;
        slot.baseX -= geometry.wrapWidth;
        wrapped = true;
        worldX = slot.baseX + pan.x;
      }

      while (worldY + geometry.cellHeight < minY) {
        slot.gridY += geometry.rows;
        slot.baseY += geometry.wrapHeight;
        wrapped = true;
        worldY = slot.baseY + pan.y;
      }

      while (worldY > maxY) {
        slot.gridY -= geometry.rows;
        slot.baseY -= geometry.wrapHeight;
        wrapped = true;
        worldY = slot.baseY + pan.y;
      }

      if (wrapped) {
        const nextImageIndex = getImageIndexFromGrid(
          slot.gridX,
          slot.gridY,
          geometry.tileColumns,
          geometry.tileRows,
          totalImages,
        );
        if (slot.imageIndex !== nextImageIndex) {
          slot.imageIndex = nextImageIndex;
          imageUpdates.set(index, nextImageIndex);
        }
      }

      gsap.set(node, { x: worldX, y: worldY, force3D: true });
    }

    if (imageUpdates.size > 0) {
      applySlotImageUpdates(imageUpdates, poolSizeRef.current);
    }

    for (let index = activeCount; index < poolSizeRef.current; index += 1) {
      const node = poolRefs.current[index];
      if (!node) {
        continue;
      }

      gsap.set(node, { visibility: "hidden" });
    }

    isDirtyRef.current = false;
  }, [applySlotImageUpdates, imageData.length]);

  const computeGeometry = useCallback((containerWidth: number, containerHeight: number) => {
    if (containerWidth <= 0 || containerHeight <= 0) {
      return;
    }

    const { tileColumns, tileRows } = getTileDimensions(imageData.length, TARGET_VISIBLE_COLUMN_COUNT);
    const columns = tileColumns;
    const rows = tileRows;
    const cellWidth = Math.max(
      180,
      Math.round(
        (containerWidth + HORIZONTAL_OVERSCAN * 2 - GAP * (TARGET_VISIBLE_COLUMN_COUNT - 1)) /
          TARGET_VISIBLE_COLUMN_COUNT,
      ),
    );
    const rowStep = CELL_HEIGHT + GAP;
    const activePoolSize = columns * rows;
    const wrapWidth = columns * cellWidth + (columns - 1) * GAP;
    const wrapHeight = rows * rowStep;
    const startX = -HORIZONTAL_OVERSCAN;
    // Start from the vertical center of the tile so users have content
    // available both above and below the viewport on first load.
    const firstRow = -Math.floor(rows / 2);

    const slots: CanvasSlot[] = [];
    const initialImageUpdates = new Map<number, number>();
    const rowOrder = getCenterOutOrder(rows);
    const columnOrder = getCenterOutOrder(columns);
    for (const rowOffset of rowOrder) {
      const rowIndex = firstRow + rowOffset;

      for (const column of columnOrder) {
        const gridIndex = getImageIndexFromGrid(
          column,
          rowIndex,
          tileColumns,
          tileRows,
          imageData.length,
        );
        const slotIndex = slots.length;
        initialImageUpdates.set(slotIndex, gridIndex);
        slots.push({
          baseX: startX + column * (cellWidth + GAP),
          baseY: rowIndex * rowStep + getCyclicColumnOffset(column),
          column,
          gridX: column,
          gridY: rowIndex,
          imageIndex: gridIndex,
          visible: true,
        });
      }
    }

    geometryRef.current = {
      columns,
      rows,
      tileColumns,
      tileRows,
      cellWidth,
      cellHeight: CELL_HEIGHT,
      rowStep,
      startX,
      firstRow,
      containerWidth,
      containerHeight,
      wrapWidth,
      wrapHeight,
      activePoolSize,
      slots,
    };

    const currentPoolSize = poolSizeRef.current;
    const nextPoolSize = Math.max(currentPoolSize, activePoolSize);
    applySlotImageUpdates(initialImageUpdates, nextPoolSize);
    if (nextPoolSize !== currentPoolSize) {
      poolSizeRef.current = nextPoolSize;
      setPoolSize(nextPoolSize);
      return;
    }

    applyLayoutToPool(nextPoolSize);
    setPanDirty();
  }, [applyLayoutToPool, applySlotImageUpdates, imageData.length, setPanDirty]);

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

  useEffect(() => {
    poolSizeRef.current = poolSize;
  }, [poolSize]);

  useEffect(() => {
    slotImageIndicesRef.current = slotImageIndices;
  }, [slotImageIndices]);

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

  useEffect(() => {
    const container = scopeRef.current;
    if (!container) {
      return;
    }

    const tickerUpdate = () => {
      processPanFrame();
    };

    let lastPointerTime = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      killInertia();
      pointerStateRef.current.isDragging = true;
      pointerStateRef.current.pointerId = event.pointerId;
      pointerStateRef.current.lastX = event.clientX;
      pointerStateRef.current.lastY = event.clientY;
      velocitySamplesRef.current = [];
      lastPointerTime = performance.now();
      container.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pointerState = pointerStateRef.current;
      if (!pointerState.isDragging || pointerState.pointerId !== event.pointerId) {
        return;
      }

      const now = performance.now();
      const dx = event.clientX - pointerState.lastX;
      const dy = event.clientY - pointerState.lastY;
      const dt = Math.max(now - lastPointerTime, 16);

      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
      lastPointerTime = now;

      applyPanDelta(dx, dy, dt);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const pointerState = pointerStateRef.current;
      if (!pointerState.isDragging || pointerState.pointerId !== event.pointerId) {
        return;
      }

      pointerState.isDragging = false;
      pointerState.pointerId = -1;
      try {
        container.releasePointerCapture(event.pointerId);
      } catch {
        // noop: capture can already be released by browser.
      }

      const { vx, vy } = getAverageVelocity();
      startInertia(vx, vy, 1.4);
      velocitySamplesRef.current = [];
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (touchStateRef.current.isDragging || event.touches.length === 0) {
        return;
      }

      killInertia();
      const touch = event.touches[0];
      touchStateRef.current.isDragging = true;
      touchStateRef.current.touchId = touch.identifier;
      touchStateRef.current.lastX = touch.clientX;
      touchStateRef.current.lastY = touch.clientY;
      velocitySamplesRef.current = [];
      lastPointerTime = performance.now();
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchState = touchStateRef.current;
      if (!touchState.isDragging) {
        return;
      }

      const touch = Array.from(event.touches).find((item) => item.identifier === touchState.touchId);
      if (!touch) {
        return;
      }

      const now = performance.now();
      const dx = touch.clientX - touchState.lastX;
      const dy = touch.clientY - touchState.lastY;
      const dt = Math.max(now - lastPointerTime, 16);

      touchState.lastX = touch.clientX;
      touchState.lastY = touch.clientY;
      lastPointerTime = now;

      applyPanDelta(dx, dy, dt);
      event.preventDefault();
    };

    const endTouch = () => {
      if (!touchStateRef.current.isDragging) {
        return;
      }

      touchStateRef.current.isDragging = false;
      touchStateRef.current.touchId = -1;
      const { vx, vy } = getAverageVelocity();
      startInertia(vx, vy, 1.4);
      velocitySamplesRef.current = [];
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        return;
      }

      event.preventDefault();
      killInertia();

      const multiplier = event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? geometryRef.current.containerHeight : 1;
      const dx = -event.deltaX * multiplier;
      const dy = -event.deltaY * multiplier;
      applyPanDelta(dx, dy, 16);

      const isTrackpad = event.deltaMode === 0;
      if (isTrackpad) {
        return;
      }

      if (wheelInertiaTimerRef.current !== null) {
        window.clearTimeout(wheelInertiaTimerRef.current);
      }

      wheelInertiaTimerRef.current = window.setTimeout(() => {
        const { vx, vy } = getAverageVelocity();
        startInertia(vx, vy, 1.3);
        velocitySamplesRef.current = [];
      }, 80);
    };

    gsap.ticker.add(tickerUpdate);
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", endTouch);
    container.addEventListener("touchcancel", endTouch);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", endTouch);
      container.removeEventListener("touchcancel", endTouch);
      container.removeEventListener("wheel", handleWheel);
      killInertia();
      if (wheelInertiaTimerRef.current !== null) {
        window.clearTimeout(wheelInertiaTimerRef.current);
      }
    };
  }, [applyPanDelta, getAverageVelocity, killInertia, processPanFrame, startInertia]);

  const pool = useMemo(() => Array.from({ length: poolSize }, (_, index) => index), [poolSize]);
  const slotImages = useMemo(
    () =>
      pool.map((slotIndex) => {
        if (imageData.length === 0) {
          return null;
        }
        const imageIndex = slotImageIndices[slotIndex] ?? 0;
        return imageData[normalizeModulo(imageIndex, imageData.length)];
      }),
    [imageData, pool, slotImageIndices],
  );

  return {
    scopeRef,
    pool,
    slotImages,
    setCellRef,
  };
}
