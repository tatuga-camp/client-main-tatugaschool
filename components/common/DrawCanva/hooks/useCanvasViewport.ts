import { useGesture } from "@use-gesture/react";
import { useCallback, useRef, useState } from "react";

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;

export type Viewport = {
  scale: number;
  x: number;
  y: number;
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export const useCanvasViewport = (
  containerRef: React.RefObject<HTMLElement>,
) => {
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const zoomAt = useCallback(
    (pointerX: number, pointerY: number, factor: number) => {
      const prev = viewportRef.current;
      const newScale = clamp(prev.scale * factor, MIN_SCALE, MAX_SCALE);
      const ratio = newScale / prev.scale;
      const newX = pointerX - ratio * (pointerX - prev.x);
      const newY = pointerY - ratio * (pointerY - prev.y);
      setViewport({ scale: newScale, x: newX, y: newY });
    },
    [],
  );

  // Two-finger pan and pinch gestures, available in ALL tool modes.
  useGesture(
    {
      onDrag: ({ touches, delta: [dx, dy], pinching, cancel }) => {
        if (pinching) {
          cancel?.();
          return;
        }
        if (touches >= 2) {
          setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
        }
      },
      onPinch: ({ origin: [ox, oy], offset: [scale], memo, first }) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return memo;
        const pointerX = ox - rect.left;
        const pointerY = oy - rect.top;

        if (first) {
          return {
            startScale: viewportRef.current.scale,
            pointerX,
            pointerY,
          };
        }
        const startScale = memo?.startScale ?? viewportRef.current.scale;
        const targetScale = clamp(startScale * scale, MIN_SCALE, MAX_SCALE);
        const ratio = targetScale / viewportRef.current.scale;
        const newX =
          pointerX - ratio * (pointerX - viewportRef.current.x);
        const newY =
          pointerY - ratio * (pointerY - viewportRef.current.y);
        setViewport({ scale: targetScale, x: newX, y: newY });
        return memo;
      },
      onWheel: ({ event, delta: [, dy] }) => {
        event.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pointerX = (event as WheelEvent).clientX - rect.left;
        const pointerY = (event as WheelEvent).clientY - rect.top;
        zoomAt(pointerX, pointerY, dy > 0 ? 0.94 : 1.06);
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      pinch: { scaleBounds: { min: 0.05, max: 5 }, rubberband: true },
      wheel: { eventOptions: { passive: false } },
      drag: { pointer: { touch: true } },
    },
  );

  const setX = useCallback(
    (x: number) => setViewport((v) => ({ ...v, x })),
    [],
  );
  const setY = useCallback(
    (y: number) => setViewport((v) => ({ ...v, y })),
    [],
  );
  const setPosition = useCallback(
    (x: number, y: number) => setViewport((v) => ({ ...v, x, y })),
    [],
  );
  const setScale = useCallback(
    (scale: number) =>
      setViewport((v) => ({ ...v, scale: clamp(scale, MIN_SCALE, MAX_SCALE) })),
    [],
  );

  const zoomIn = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(rect.width / 2, rect.height / 2, 1.2);
  }, [zoomAt]);

  const zoomOut = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(rect.width / 2, rect.height / 2, 1 / 1.2);
  }, [zoomAt]);

  const fitTo = useCallback(
    (contentWidth: number, contentHeight: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = rect.width / contentWidth;
      const scaleY = rect.height / contentHeight;
      const scale = clamp(Math.min(scaleX, scaleY) * 0.95, MIN_SCALE, MAX_SCALE);
      const x = (rect.width - contentWidth * scale) / 2;
      const y = (rect.height - contentHeight * scale) / 2;
      setViewport({ scale, x, y });
    },
    [],
  );

  const reset = useCallback(() => setViewport({ scale: 1, x: 0, y: 0 }), []);

  return {
    viewport,
    setPosition,
    setScale,
    setX,
    setY,
    zoomIn,
    zoomOut,
    fitTo,
    reset,
    MIN_SCALE,
    MAX_SCALE,
  };
};
