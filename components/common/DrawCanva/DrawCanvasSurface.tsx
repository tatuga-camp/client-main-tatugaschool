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
  // The in-progress stroke lives in a ref and is painted via rAF so that
  // 120Hz pointer input on iPad doesn't trigger a React re-render per event.
  const currentStrokeRef = useRef<StrokeAnnotation | null>(null);
  const drawingPointerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [draftShape, setDraftShape] = useState<ShapeAnnotation | null>(null);

  const isCanvasActive = isInkMode(mode);

  const renderTempCanvas = useCallback(() => {
    const canvas = tempCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentStrokeRef.current) drawStroke(ctx, currentStrokeRef.current);
  }, []);

  const scheduleTempRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      renderTempCanvas();
    });
  }, [renderTempCanvas]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // offsetX/offsetY is unreliable in Safari when an ancestor has a CSS
  // scale() transform, so map client coordinates onto the canvas bitmap
  // through its bounding rect instead.
  const getCanvasPoint = useCallback(
    (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const discardActiveInput = useCallback(() => {
    currentStrokeRef.current = null;
    drawingPointerRef.current = null;
    setDraftShape(null);
    renderTempCanvas();
  }, [renderTempCanvas]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (stylusOnly && e.pointerType === "touch") return;
      // A second finger landing means the user wants to pinch/pan, not
      // draw — drop the half-drawn input instead of leaving a stray mark.
      if (
        e.pointerType === "touch" &&
        drawingPointerRef.current !== null &&
        drawingPointerRef.current !== e.pointerId
      ) {
        discardActiveInput();
        return;
      }
      const canvas = e.currentTarget;
      canvas.setPointerCapture(e.pointerId);
      const { x, y } = getCanvasPoint(canvas, e.clientX, e.clientY);

      if (mode === "sticky") {
        onStickyDrop(x, y);
        return;
      }

      if (mode === "stamp") {
        onStampDrop(x, y);
        return;
      }

      if (mode === "shape") {
        drawingPointerRef.current = e.pointerId;
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
      drawingPointerRef.current = e.pointerId;
      const pressure =
        e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5;
      currentStrokeRef.current = {
        kind: "stroke",
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        points: [[x, y, pressure]],
        color: brushColor,
        size: mode === "highlighter" ? brushRadius * 4 : brushRadius * 2,
        isEraser: mode === "eraser",
        isHighlighter: mode === "highlighter",
      };
      scheduleTempRender();
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
      getCanvasPoint,
      scheduleTempRender,
      discardActiveInput,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (drawingPointerRef.current !== e.pointerId) return;
      const canvas = e.currentTarget;

      if (mode === "shape") {
        const { x, y } = getCanvasPoint(canvas, e.clientX, e.clientY);
        setDraftShape((prev) => (prev ? { ...prev, x2: x, y2: y } : prev));
        return;
      }

      const stroke = currentStrokeRef.current;
      if (!isCanvasActive || !stroke) return;
      const native = e.nativeEvent;
      // Coalesced events carry the full-rate input samples (120Hz pencil)
      // that the browser batched between frames — using them keeps fast
      // strokes from turning into straight segments.
      const samples =
        typeof native.getCoalescedEvents === "function" &&
        native.getCoalescedEvents().length > 0
          ? native.getCoalescedEvents()
          : [native];
      for (const sample of samples) {
        const { x, y } = getCanvasPoint(canvas, sample.clientX, sample.clientY);
        const pressure =
          e.pointerType === "pen" && sample.pressure > 0
            ? sample.pressure
            : 0.5;
        stroke.points.push([x, y, pressure]);
      }
      scheduleTempRender();
    },
    [isCanvasActive, mode, getCanvasPoint, scheduleTempRender],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (
        drawingPointerRef.current !== null &&
        drawingPointerRef.current !== e.pointerId
      ) {
        return;
      }
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      drawingPointerRef.current = null;
      if (draftShape) {
        onShapeComplete(draftShape);
        setDraftShape(null);
        return;
      }
      const stroke = currentStrokeRef.current;
      if (stroke) {
        currentStrokeRef.current = null;
        onStrokeComplete(stroke);
        renderTempCanvas();
      }
    },
    [draftShape, onStrokeComplete, onShapeComplete, renderTempCanvas],
  );

  // iOS fires pointercancel when the system takes over the gesture
  // (scroll, pinch, app switch) — discard instead of committing garbage.
  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (
        drawingPointerRef.current !== null &&
        drawingPointerRef.current !== e.pointerId
      ) {
        return;
      }
      discardActiveInput();
    },
    [discardActiveInput],
  );

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

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

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
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: "100vw",
        height: "calc(100dvh - 5rem)",
        overflow: "hidden",
        cursor:
          mode === "mouse" && !isDraggingAnnotation
            ? isPanning
              ? "grabbing"
              : "grab"
            : "default",
        touchAction: "none",
        // Without these, double-tap / long-press on iPadOS selects the
        // background image and pops the Copy/Save callout.
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        overscrollBehavior: "none",
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
              draggable={false}
              className="absolute left-0 top-0 h-full w-full"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
              }}
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
            onPointerCancel={handlePointerCancel}
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
