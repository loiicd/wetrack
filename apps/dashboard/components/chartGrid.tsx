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

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(container.getBoundingClientRect().width);
    });

    resizeObserver.observe(container);
    setContainerWidth(container.getBoundingClientRect().width);

    return () => resizeObserver.disconnect();
  }, []);

  const columnWidth =
    containerWidth > 0 ? (containerWidth - gap * (columns - 1)) / columns : 0;

  const maxRow = Math.max(...widgets.map((w) => w.y + w.h), 1);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: maxRow * (rowHeight + gap) - gap,
      }}
    >
      {widgets.map((widget) => (
        <div
          key={widget.id}
          style={{
            position: "absolute",
            left: widget.x * (columnWidth + gap),
            top: widget.y * (rowHeight + gap),
            width: widget.w * columnWidth + (widget.w - 1) * gap,
            height: widget.h * rowHeight + (widget.h - 1) * gap,
          }}
        >
          {widget.content}
        </div>
      ))}
    </div>
  );
};

export default ChartGrid;
