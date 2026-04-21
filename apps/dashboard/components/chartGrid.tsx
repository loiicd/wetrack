"use client";

import { ReactNode } from "react";
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";

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
  rowHeight?: number;
};

const ChartGrid = ({
  widgets,
  columns = 12,
  rowHeight = 160,
}: ChartGridProps) => {
  const { width, containerRef, mounted } = useContainerWidth();

  const layout = widgets.map((w) => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    static: true,
  }));

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: columns, rowHeight, margin: [10, 10] }}
          dragConfig={{ enabled: false }}
          resizeConfig={{ enabled: false }}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="h-full">
              {widget.content}
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
};

export default ChartGrid;
