"use client";

import { ReactNode, useRef, useState, useEffect } from "react";

type WidgetLayout = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: ReactNode;
};

type ChartGridProps = {
  widgets: WidgetLayout[];
  columns?: number;
  gap?: number;
  rowHeight?: number;
};

// Breakpoints for responsive column count
const BREAKPOINTS = [
  { maxWidth: 480, cols: 1 },
  { maxWidth: 720, cols: 4 },
] as const;

// Reflow widgets into fewer columns by stacking them vertically in order.
// Widgets that span more than the available cols are clamped to full width.
function reflowWidgets(
  widgets: WidgetLayout[],
  targetCols: number,
  sourceCols: number,
): { id: string; rx: number; ry: number; rw: number; rh: number }[] {
  const scale = targetCols / sourceCols;
  // Sort by original reading order: top-to-bottom, left-to-right
  const sorted = [...widgets].sort((a, b) => a.y - b.y || a.x - b.x);

  // Simple bin-packing: track the lowest occupied row per column
  const colHeights = new Array<number>(targetCols).fill(0);

  return sorted.map((w) => {
    const rw = Math.max(1, Math.min(targetCols, Math.round(w.w * scale)));
    // Find the leftmost position where the widget fits without overlap
    let bestX = 0;
    let bestY = Infinity;
    for (let x = 0; x <= targetCols - rw; x++) {
      const top = Math.max(...colHeights.slice(x, x + rw));
      if (top < bestY) {
        bestY = top;
        bestX = x;
      }
    }
    const ry = bestY;
    // Mark columns as occupied
    for (let c = bestX; c < bestX + rw; c++) {
      colHeights[c] = ry + w.h;
    }
    return { id: w.id, rx: bestX, ry, rw, rh: w.h };
  });
}

const ChartGrid = ({
  widgets,
  columns = 12,
  gap = 10,
  rowHeight = 160,
}: ChartGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      setContainerWidth(container.getBoundingClientRect().width);
    });
    ro.observe(container);
    setContainerWidth(container.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Pick effective column count based on container width
  const effectiveCols =
    containerWidth > 0
      ? (BREAKPOINTS.find((bp) => containerWidth <= bp.maxWidth)?.cols ?? columns)
      : columns;

  const isReflowed = effectiveCols < columns;
  const layoutMap = isReflowed
    ? new Map(reflowWidgets(widgets, effectiveCols, columns).map((r) => [r.id, r]))
    : null;

  const columnWidth =
    containerWidth > 0 ? (containerWidth - gap * (effectiveCols - 1)) / effectiveCols : 0;

  const maxRow = isReflowed
    ? Math.max(...(layoutMap ? [...layoutMap.values()].map((r) => r.ry + r.rh) : [1]), 1)
    : Math.max(...widgets.map((w) => w.y + w.h), 1);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: maxRow * (rowHeight + gap) - gap,
      }}
    >
      {widgets.map((widget) => {
        const r = layoutMap?.get(widget.id);
        const x = r ? r.rx : widget.x;
        const y = r ? r.ry : widget.y;
        const w = r ? r.rw : widget.w;
        const h = r ? r.rh : widget.h;

        return (
          <div
            key={widget.id}
            style={{
              position: "absolute",
              left: x * (columnWidth + gap),
              top: y * (rowHeight + gap),
              width: w * columnWidth + (w - 1) * gap,
              height: h * rowHeight + (h - 1) * gap,
              transition: "all 0.2s ease",
            }}
          >
            {widget.content}
          </div>
        );
      })}
    </div>
  );
};

export default ChartGrid;
