import React from "react";
import { ShapeAnnotation } from "./types";

export const ShapeRenderer: React.FC<{ shape: ShapeAnnotation }> = ({
  shape,
}) => {
  const { x1, y1, x2, y2, color, thickness } = shape;
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);

  switch (shape.shape) {
    case "rect":
      return (
        <rect
          x={minX}
          y={minY}
          width={w}
          height={h}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx={minX + w / 2}
          cy={minY + h / 2}
          rx={w / 2}
          ry={h / 2}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
        />
      );
    case "arrow": {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = 14;
      const hx1 = x2 - head * Math.cos(angle - Math.PI / 6);
      const hy1 = y2 - head * Math.sin(angle - Math.PI / 6);
      const hx2 = x2 - head * Math.cos(angle + Math.PI / 6);
      const hy2 = y2 - head * Math.sin(angle + Math.PI / 6);
      return (
        <g
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          <line x1={x1} y1={y1} x2={x2} y2={y2} />
          <line x1={x2} y1={y2} x2={hx1} y2={hy1} />
          <line x1={x2} y1={y2} x2={hx2} y2={hy2} />
        </g>
      );
    }
  }
};
