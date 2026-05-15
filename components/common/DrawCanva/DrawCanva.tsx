import { DragEndEvent } from "@dnd-kit/core";
import React, { useEffect, useRef, useState } from "react";
import { BiSave } from "react-icons/bi";
import { GrRedo, GrRevert } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { LuExpand, LuMinus, LuPlus, LuRotateCcw } from "react-icons/lu";
import { urlToFile } from "../../../utils";
import { DrawCanvasSurface, drawStroke } from "./DrawCanvasSurface";
import { DrawToolbar } from "./DrawToolbar";
import { useCanvasViewport } from "./hooks/useCanvasViewport";
import { useDrawingHistory } from "./hooks/useDrawingHistory";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { newId } from "./types";
import type {
  ModeType,
  ShapeAnnotation,
  ShapeKind,
  StampAnnotation,
  StampSymbol,
  StickyAnnotation,
  TextAnnotation,
} from "./types";

type Props = {
  imageURL: string;
  name: string;
  id: string;
  onClose: () => void;
  onSave: (data: { file: File; id: string }) => void;
};
const DrawCanva = ({ imageURL, onClose, name, onSave }: Props) => {
  const [image, setImage] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<ModeType>("mouse");
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushRadius, setBrushRadius] = useState<number>(5);
  const [stylusOnly, setStylusOnly] = useState(false);
  const [shapeKind, setShapeKind] = useState<ShapeKind>("arrow");
  const [stampSymbol, setStampSymbol] = useState<StampSymbol>("check");
  const [loadingImage, setLoadingImage] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);

  const [currentText, setCurrentText] = useState<string>("");
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  const [textColor, setTextColor] = useState<string>("#000000");
  const [textSize, setTextSize] = useState<number>(20);

  const [canvasWidth, setCanvasWidth] = useState<number>(1000);
  const [canvasHeight, setCanvasHeight] = useState<number>(1000);
  const [renderScale, setRenderScale] = useState<number>(1);
  const [originalSize, setOriginalSize] = useState<{
    width: number;
    height: number;
  }>({ width: 1000, height: 1000 });
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    viewport,
    setPosition,
    zoomIn,
    zoomOut,
    fitTo,
    reset: resetView,
  } = useCanvasViewport(containerRef);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanMouse, setStartPanMouse] = useState({ x: 0, y: 0 }); // For mouse panning
  const [startPanTouch, setStartPanTouch] = useState<{
    x: number;
    y: number;
  } | null>(null); // For touch panning

  const history = useDrawingHistory();
  const {
    annotations,
    add,
    remove,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
  } = history;

  const switchToDrawMode = (newMode: "draw" | "eraser" | "highlighter") => {
    setMode(newMode);
  };

  const switchToMouseMode = () => {
    setMode("mouse");
  };

  const handleSelectMode = (next: ModeType) => {
    if (next === "draw" || next === "eraser" || next === "highlighter") {
      if (next === "highlighter") {
        const lower = brushColor.toLowerCase();
        if (lower === "#000000" || lower === "#ffffff") {
          setBrushColor("#FFEB3B");
        }
      }
      switchToDrawMode(next);
      return;
    }
    if (next === "mouse") {
      switchToMouseMode();
      return;
    }
    if (next === "text") {
      handleAddText();
      return;
    }
    setMode(next);
  };

  const handleDragStart = () => {
    setIsDraggingText(true);
  };

  useEffect(() => {
    handleShowImage();
  }, []); // imageURL is a prop, if it can change, add it to dependency array. Assuming it's initial.

  const handleShowImage = async () => {
    setLoadingImage(true);
    // Consider aborting if component unmounts or imageURL changes rapidly
    const file = await urlToFile(imageURL);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIMENSION = 1500;
          let scale = 1;
          if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
            scale = Math.min(
              MAX_DIMENSION / img.width,
              MAX_DIMENSION / img.height,
            );
          }
          setRenderScale(scale);
          setOriginalSize({ width: img.width, height: img.height });
          setCanvasWidth(img.width * scale);
          setCanvasHeight(img.height * scale);
          setImage(imageUrl);
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
    setLoadingImage(false);
  };

  const handleAddText = () => {
    setMode("text-edit");
    const id = newId();
    const initialText = "Add Your Text Here";
    setCurrentText(initialText);
    setCurrentEditId(id);
    const newAnnotation: TextAnnotation = {
      kind: "text",
      id,
      text: initialText,
      x: canvasWidth / 2 - viewport.x / viewport.scale,
      y: canvasHeight / 2 - viewport.y / viewport.scale,
      color: textColor,
      fontSize: textSize,
    };
    add(newAnnotation);
    setTimeout(() => {
      textAreaRef.current?.focus();
      textAreaRef.current?.select();
    }, 100);
  };

  const handleFinishEditing = () => {
    if (!currentEditId) {
      setMode("mouse");
      setCurrentText("");
      return;
    }
    const before = annotations.find((a) => a.id === currentEditId);
    if (before) {
      if (before.kind === "text") {
        update(before, {
          ...before,
          text: currentText,
          color: textColor,
          fontSize: textSize,
        });
      } else if (before.kind === "sticky") {
        update(before, {
          ...before,
          text: currentText,
        });
      }
    }
    setMode("mouse");
    setCurrentEditId(null);
    setCurrentText("");
  };

  const handleTextClick = (id: string) => {
    if (mode !== "draw" && mode !== "mouse") return;
    const target = annotations.find((a) => a.id === id);
    if (!target) return;
    if (target.kind === "text") {
      setMode("text-edit");
      setCurrentEditId(id);
      setCurrentText(target.text);
      setTextColor(target.color);
      setTextSize(target.fontSize);
      setTimeout(() => {
        textAreaRef.current?.focus();
        textAreaRef.current?.select();
      }, 0);
    } else if (target.kind === "sticky") {
      setMode("text-edit");
      setCurrentEditId(id);
      setCurrentText(target.text);
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 0);
    }
  };

  const handleDeleteCurrentText = () => {
    if (!currentEditId) return;
    const target = annotations.find((a) => a.id === currentEditId);
    if (target) remove(target);
    setMode("mouse");
    setCurrentEditId(null);
    setCurrentText("");
  };

  const handleInsertTemplate = (text: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : canvasWidth / 2;
    const cy = rect ? rect.height / 2 : canvasHeight / 2;
    const x = (cx - viewport.x) / viewport.scale;
    const y = (cy - viewport.y) / viewport.scale;
    add({
      kind: "text",
      id: newId(),
      x,
      y,
      text,
      color: textColor,
      fontSize: textSize,
    });
  };

  const handleStampDrop = (x: number, y: number) => {
    const color =
      brushColor.toLowerCase() === "#000000" ? "#16a34a" : brushColor;
    const stamp: StampAnnotation = {
      kind: "stamp",
      id: newId(),
      x,
      y,
      symbol: stampSymbol,
      size: 32,
      color,
    };
    add(stamp);
  };

  const handleStickyDrop = (x: number, y: number) => {
    const id = newId();
    const note: StickyAnnotation = {
      kind: "sticky",
      id,
      x,
      y,
      width: 220,
      height: 120,
      text: "",
      bgColor: "#FEF3C7",
      textColor: "#111827",
    };
    add(note);
    setCurrentEditId(id);
    setCurrentText("");
    setMode("text-edit");
    setTimeout(() => {
      textAreaRef.current?.focus();
    }, 50);
  };

  const handleSave = () => {
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = originalSize.width;
    finalCanvas.height = originalSize.height;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    const stampGlyph = (s: "check" | "cross" | "star" | "smile") =>
      s === "check" ? "✓" : s === "cross" ? "✗" : s === "star" ? "★" : "☺";

    const renderAll = () => {
      ctx.save();
      const inv = 1 / renderScale;
      ctx.scale(inv, inv);

      // 1. strokes (ink + highlighter + eraser)
      annotations.forEach((a) => {
        if (a.kind === "stroke") drawStroke(ctx, a);
      });

      // 2. shapes
      annotations.forEach((a) => {
        if (a.kind !== "shape") return;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.thickness;
        ctx.lineCap = "round";
        ctx.beginPath();
        const minX = Math.min(a.x1, a.x2);
        const minY = Math.min(a.y1, a.y2);
        const w = Math.abs(a.x2 - a.x1);
        const h = Math.abs(a.y2 - a.y1);
        if (a.shape === "rect") {
          ctx.strokeRect(minX, minY, w, h);
        } else if (a.shape === "ellipse") {
          ctx.ellipse(
            minX + w / 2,
            minY + h / 2,
            w / 2,
            h / 2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        } else {
          // arrow
          ctx.moveTo(a.x1, a.y1);
          ctx.lineTo(a.x2, a.y2);
          ctx.stroke();
          const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
          const head = 14;
          ctx.beginPath();
          ctx.moveTo(a.x2, a.y2);
          ctx.lineTo(
            a.x2 - head * Math.cos(angle - Math.PI / 6),
            a.y2 - head * Math.sin(angle - Math.PI / 6),
          );
          ctx.moveTo(a.x2, a.y2);
          ctx.lineTo(
            a.x2 - head * Math.cos(angle + Math.PI / 6),
            a.y2 - head * Math.sin(angle + Math.PI / 6),
          );
          ctx.stroke();
        }
      });

      // 3. text
      annotations.forEach((a) => {
        if (a.kind !== "text") return;
        ctx.fillStyle = a.color;
        ctx.font = `${a.fontSize}px Arial`;
        a.text.split("\n").forEach((line, i) => {
          ctx.fillText(line, a.x, a.y + (i + 1) * a.fontSize);
        });
      });

      // 4. stamps
      annotations.forEach((a) => {
        if (a.kind !== "stamp") return;
        ctx.fillStyle = a.color;
        ctx.font = `${a.size}px Arial`;
        ctx.fillText(stampGlyph(a.symbol), a.x, a.y + a.size);
      });

      // 5. sticky notes
      annotations.forEach((a) => {
        if (a.kind !== "sticky") return;
        ctx.fillStyle = a.bgColor;
        ctx.fillRect(a.x, a.y, a.width, a.height);
        ctx.fillStyle = a.textColor;
        ctx.font = "14px Arial";
        const lineHeight = 18;
        a.text.split("\n").forEach((line, i) => {
          ctx.fillText(line, a.x + 12, a.y + 12 + (i + 1) * lineHeight - 4);
        });
      });

      ctx.restore();

      finalCanvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], name || "canvas-image.png", {
          type: "image/png",
        });
        onSave({ file, id: name || "canvas-image" });
      }, "image/png");
    };

    if (image) {
      const bg = new Image();
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, finalCanvas.width, finalCanvas.height);
        renderAll();
      };
      bg.onerror = renderAll;
      bg.src = image;
    } else {
      renderAll();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id);
    const before = annotations.find((a) => a.id === id);
    if (!before) {
      setIsDraggingText(false);
      return;
    }
    if (
      before.kind === "text" ||
      before.kind === "stamp" ||
      before.kind === "sticky"
    ) {
      const after = {
        ...before,
        x: before.x + event.delta.x,
        y: before.y + event.delta.y,
      };
      update(before, after);
    }
    setIsDraggingText(false);
  };

  useKeyboardShortcuts({
    pen: () => handleSelectMode("draw"),
    highlighter: () => handleSelectMode("highlighter"),
    eraser: () => handleSelectMode("eraser"),
    text: () => handleSelectMode("text"),
    shape: () => handleSelectMode("shape"),
    select: () => handleSelectMode("mouse"),
    undo,
    redo,
    escape: () => {
      if (mode === "text-edit") {
        handleFinishEditing();
      } else {
        setMode("mouse");
      }
    },
  });

  const renderEditingTextarea = (): React.ReactNode => {
    if (!(mode === "text-edit" && currentEditId !== null)) return null;
    const current = annotations.find((a) => a.id === currentEditId);
    if (!current) return null;
    const isText = current.kind === "text";
    const isSticky = current.kind === "sticky";
    if (!isText && !isSticky) return null;

    const textareaStyle: React.CSSProperties = isSticky
      ? {
          width: current.width,
          minHeight: current.height,
          background: current.bgColor,
          color: current.textColor,
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          fontSize: 14,
          lineHeight: 1.35,
          outline: "none",
          resize: "none",
          border: "2px dashed rgba(0,0,0,0.2)",
        }
      : {
          fontSize: `${current.fontSize}px`,
          color: current.color,
          lineHeight: `${current.fontSize * 1.2}px`,
          border: "1px dashed blue",
          background: "rgba(255, 255, 255, 0.8)",
          resize: "none",
          outline: "none",
        };

    return (
      <div
        style={{
          position: "absolute",
          left: current.x,
          top: current.y,
          zIndex: 50,
        }}
      >
        <textarea
          ref={textAreaRef}
          value={currentText}
          style={textareaStyle}
          onChange={(e) => {
            const newText = e.target.value;
            setCurrentText(newText);
            update(current, { ...current, text: newText });
          }}
          className="p-1"
          rows={isSticky ? 5 : Math.max(3, currentText.split("\n").length)}
          cols={isSticky ? undefined : 40}
        />
        <div className="absolute -top-12 left-0 z-40 flex items-center gap-2 rounded-xl bg-white px-2 py-1 shadow-md ring-1 ring-black/10">
          {isText && (
            <>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  const c = e.target.value;
                  setTextColor(c);
                  const before = annotations.find((a) => a.id === currentEditId);
                  if (before && before.kind === "text") {
                    update(before, { ...before, color: c });
                  }
                }}
                className="h-6 w-6 cursor-pointer rounded-full border-none bg-transparent p-0"
                title="Text color"
              />
              <input
                type="number"
                min={10}
                max={100}
                value={textSize}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (n < 10 || n > 100) return;
                  setTextSize(n);
                  const before = annotations.find((a) => a.id === currentEditId);
                  if (before && before.kind === "text") {
                    update(before, { ...before, fontSize: n });
                  }
                }}
                className="w-14 rounded border px-1 text-center text-sm"
              />
            </>
          )}
          {isSticky && (
            <input
              type="color"
              value={current.bgColor}
              onChange={(e) => {
                const c = e.target.value;
                const before = annotations.find((a) => a.id === currentEditId);
                if (before && before.kind === "sticky") {
                  update(before, { ...before, bgColor: c });
                }
              }}
              className="h-6 w-6 cursor-pointer rounded-full border-none bg-transparent p-0"
              title="Note color"
            />
          )}
          <button
            type="button"
            onClick={handleFinishEditing}
            className="rounded bg-sky-500 px-2 py-1 text-xs text-white hover:bg-sky-600"
          >
            Done
          </button>
          <button
            type="button"
            onClick={handleDeleteCurrentText}
            className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-gray-200">
      {loadingImage && (
        <div className="fixed top-0 z-20 flex h-full w-full items-center justify-center bg-white/80 backdrop-blur-sm">
          Loading...
        </div>
      )}
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-sky-700/90 to-sky-600/90 px-4 py-3 text-white shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo}
            className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/40 transition hover:bg-white/10 disabled:opacity-40"
          >
            <GrRevert />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Shift+Z)"
            onClick={redo}
            disabled={!canRedo}
            className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/40 transition hover:bg-white/10 disabled:opacity-40"
          >
            <GrRedo />
          </button>
        </div>
        <h1 className="hideScrollBar mx-4 max-w-[40vw] truncate text-center text-base font-medium">
          {name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Save"
            onClick={handleSave}
            className="flex h-9 items-center gap-1 rounded-full bg-white px-4 text-sm font-medium text-sky-700 transition hover:bg-sky-50 active:scale-95"
          >
            <BiSave /> Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/40 hover:bg-white/10"
          >
            <IoMdClose />
          </button>
        </div>
      </div>

      <DrawToolbar
        mode={mode}
        onSelectMode={handleSelectMode}
        brushColor={brushColor}
        onBrushColorChange={setBrushColor}
        brushRadius={brushRadius}
        onBrushRadiusChange={setBrushRadius}
        stylusOnly={stylusOnly}
        onToggleStylusOnly={() => setStylusOnly((v) => !v)}
        shapeKind={shapeKind}
        onSelectShapeKind={setShapeKind}
        stampSymbol={stampSymbol}
        onSelectStampSymbol={setStampSymbol}
        onInsertTemplate={handleInsertTemplate}
      />

      {/* Canvas Area */}
      <div ref={containerRef} className="relative">
        <DrawCanvasSurface
          image={image}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          viewport={viewport}
          mode={mode}
          brushColor={brushColor}
          brushRadius={brushRadius}
          stylusOnly={stylusOnly}
          annotations={annotations}
          currentEditId={currentEditId}
          isPanning={isPanning}
          isDraggingAnnotation={isDraggingText}
          onPanStart={(cx, cy) => {
            if (mode !== "mouse" || isDraggingText) return;
            setIsPanning(true);
            setStartPanMouse({ x: cx - viewport.x, y: cy - viewport.y });
            setStartPanTouch(null);
          }}
          onPanMove={(cx, cy) => {
            if (
              isPanning &&
              (startPanMouse.x !== 0 || startPanMouse.y !== 0) &&
              !startPanTouch &&
              mode === "mouse" &&
              !isDraggingText
            ) {
              setPosition(cx - startPanMouse.x, cy - startPanMouse.y);
            } else if (
              isPanning &&
              startPanTouch &&
              mode === "mouse" &&
              !isDraggingText
            ) {
              setPosition(cx - startPanTouch.x, cy - startPanTouch.y);
            }
          }}
          onPanEnd={() => {
            if (isPanning) {
              setIsPanning(false);
              setStartPanTouch(null);
            }
          }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onActivateAnnotation={handleTextClick}
          onStrokeComplete={(stroke) => add(stroke)}
          shapeKind={shapeKind}
          onShapeComplete={(shape: ShapeAnnotation) => add(shape)}
          onStampDrop={handleStampDrop}
          onStickyDrop={handleStickyDrop}
          renderEditingTextarea={renderEditingTextarea}
        />
      </div>

      {/* Floating zoom controls */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1 rounded-2xl bg-white/85 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-200"
        >
          <LuMinus />
        </button>
        <span className="min-w-[3.5rem] text-center text-sm tabular-nums text-gray-700">
          {Math.round(viewport.scale * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          title="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-200"
        >
          <LuPlus />
        </button>
        <button
          type="button"
          onClick={() => fitTo(canvasWidth, canvasHeight)}
          title="Fit to screen"
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-200"
        >
          <LuExpand />
        </button>
        <button
          type="button"
          onClick={resetView}
          title="Reset zoom"
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-200"
        >
          <LuRotateCcw />
        </button>
      </div>
    </div>
  );
};

export default DrawCanva;
