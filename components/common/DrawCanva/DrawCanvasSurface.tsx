import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { getStroke } from "perfect-freehand";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DraggableAnnotation } from "./DraggableAnnotation";
import { Viewport } from "./hooks/useCanvasViewport";
import { ShapeRenderer } from "./ShapeRenderer";
import {
  Annotation,
  ModeType,
  ShapeAnnotation,
  ShapeKind,
  StampAnnotation,
  StickyAnnotation,
  StrokeAnnotation,
  TextAnnotation,
} from "./types";

type Props = {
  image: string | null;
  canvasWidth: number;
  canvasHeight: number;
  viewport: Viewport;
  mode: ModeType;
  brushColor: string;
  brushRadius: number;
  stylusOnly: boolean;
  annotations: Annotation[];
  currentEditId: string | null;
  isPanning: boolean;
  isDraggingAnnotation: boolean;
  onPanStart: (clientX: number, clientY: number) => void;
  onPanMove: (clientX: number, clientY: number) => void;
  onPanEnd: () => void;
  onDragStart: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onActivateAnnotation: (id: string) => void;
  onStrokeComplete: (stroke: StrokeAnnotation) => void;
  shapeKind: ShapeKind;
  onShapeComplete: (shape: ShapeAnnotation) => void;
  onStampDrop: (x: number, y: number) => void;
  onStickyDrop: (x: number, y: number) => void;
  renderEditingTextarea: () => React.ReactNode;
};

const drawStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: StrokeAnnotation,
) => {
  const outline = getStroke(stroke.points, {
    size: stroke.size,
    thinning: stroke.isHighlighter ? 0 : 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  if (outline.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i][0], outline[i][1]);
  }
  ctx.closePath();
  if (stroke.isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
  } else if (stroke.isHighlighter) {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = 0.35;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = 1;
  }
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};

const isInkMode = (mode: ModeType): boolean =>
  mode === "draw" || mode === "highlighter" || mode === "eraser";

export const DrawCanvasSurface: React.FC<Props> = ({
  image,
  canvasWidth,
  canvasHeight,
  viewport,
  mode,
  brushColor,
  brushRadius,
  stylusOnly,
  annotations,
  currentEditId,
  isPanning,
  isDraggingAnnotation,
  onPanStart,
  onPanMove,
  onPanEnd,
  onDragStart,
  onDragEnd,
  onActivateAnnotation,
  onStrokeComplete,
  shapeKind,
  onShapeComplete,
  onStampDrop,
  onStickyDrop,
  renderEditingTextarea,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStroke, setCurrentStroke] = useState<StrokeAnnotation | null>(
    null,
  );
  const [draftShape, setDraftShape] = useState<ShapeAnnotation | null>(null);

  const isCanvasActive = isInkMode(mode);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (stylusOnly && e.pointerType === "touch") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;

      if (mode === "sticky") {
        onStickyDrop(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        return;
      }

      if (mode === "stamp") {
        onStampDrop(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        return;
      }

      if (mode === "shape") {
        setDraftShape({
          kind: "shape",
          id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          shape: shapeKind,
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          color: brushColor,
          thickness: Math.max(2, brushRadius / 2),
        });
        return;
      }

      if (!isCanvasActive) return;
      const point = [x, y, e.pressure || 0.5];
      setCurrentStroke({
        kind: "stroke",
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        points: [point],
        color: brushColor,
        size: mode === "highlighter" ? brushRadius * 4 : brushRadius * 2,
        isEraser: mode === "eraser",
        isHighlighter: mode === "highlighter",
      });
    },
    [
      isCanvasActive,
      brushColor,
      brushRadius,
      mode,
      shapeKind,
      stylusOnly,
      onStampDrop,
      onStickyDrop,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (stylusOnly && e.pointerType === "touch") return;
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;

      if (mode === "shape" && draftShape) {
        setDraftShape({ ...draftShape, x2: x, y2: y });
        return;
      }

      if (!isCanvasActive || !currentStroke) return;
      const point = [x, y, e.pressure || 0.5];
      setCurrentStroke((prev) =>
        prev ? { ...prev, points: [...prev.points, point] } : null,
      );
    },
    [isCanvasActive, currentStroke, mode, draftShape, stylusOnly],
  );

  const handlePointerUp = useCallback(() => {
    if (draftShape) {
      onShapeComplete(draftShape);
      setDraftShape(null);
      return;
    }
    if (currentStroke) {
      onStrokeComplete(currentStroke);
      setCurrentStroke(null);
    }
  }, [currentStroke, draftShape, onStrokeComplete, onShapeComplete]);

  // Persist annotations to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    annotations.forEach((a) => {
      if (a.kind === "stroke") drawStroke(ctx, a);
    });
  }, [annotations, canvasWidth, canvasHeight]);

  // Active stroke on temp canvas
  useEffect(() => {
    const canvas = tempCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentStroke) drawStroke(ctx, currentStroke);
  }, [currentStroke, canvasWidth, canvasHeight]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(mouseSensor, useSensor(TouchSensor));

  return (
    <div
      onMouseDown={(e) => {
        if (mode === "mouse" && !isDraggingAnnotation && e.button === 0) {
          onPanStart(e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => {
        if (isPanning) onPanMove(e.clientX, e.clientY);
      }}
      onMouseUp={onPanEnd}
      onMouseLeave={onPanEnd}
      onTouchStart={(e) => {
        if (
          mode === "mouse" &&
          !isDraggingAnnotation &&
          e.touches.length === 1
        ) {
          const t = e.touches[0];
          onPanStart(t.clientX, t.clientY);
        }
      }}
      onTouchMove={(e) => {
        if (isPanning && e.touches.length === 1) {
          const t = e.touches[0];
          onPanMove(t.clientX, t.clientY);
        }
      }}
      onTouchEnd={onPanEnd}
      onTouchCancel={onPanEnd}
      style={{
        width: "100vw",
        height: "calc(100vh - 5rem)",
        overflow: "hidden",
        cursor:
          mode === "mouse" && !isDraggingAnnotation
            ? isPanning
              ? "grabbing"
              : "grab"
            : "default",
        touchAction: "none",
      }}
      className="mt-16"
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            width: canvasWidth,
            height: canvasHeight,
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          {renderEditingTextarea()}

          {image && (
            <img
              src={image}
              alt="Annotation background"
              className="absolute left-0 top-0 h-full w-full"
              style={{ pointerEvents: "none" }}
            />
          )}

          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute left-0 top-0"
            style={{ pointerEvents: "none" }}
          />
          <canvas
            ref={tempCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="absolute left-0 top-0"
            style={{
              pointerEvents:
                isCanvasActive ||
                mode === "shape" ||
                mode === "stamp" ||
                mode === "sticky"
                  ? "auto"
                  : "none",
              touchAction: "none",
            }}
          />

          <svg
            className="absolute left-0 top-0"
            width={canvasWidth}
            height={canvasHeight}
            style={{ pointerEvents: "none" }}
          >
            {annotations
              .filter((a): a is ShapeAnnotation => a.kind === "shape")
              .map((s) => (
                <ShapeRenderer key={s.id} shape={s} />
              ))}
            {draftShape && <ShapeRenderer shape={draftShape} />}
          </svg>

          {annotations
            .filter(
              (a): a is TextAnnotation | StampAnnotation | StickyAnnotation =>
                a.kind === "text" ||
                a.kind === "stamp" ||
                a.kind === "sticky",
            )
            .filter((a) => a.id !== currentEditId)
            .map((a) => (
              <DraggableAnnotation
                key={a.id}
                obj={a}
                mode={mode}
                currentEditId={currentEditId}
                onActivate={onActivateAnnotation}
              />
            ))}
        </div>
      </DndContext>
    </div>
  );
};

export { drawStroke };
