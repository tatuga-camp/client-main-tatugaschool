import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import ImageNextJs from "next/image";
import React, { useEffect, useRef, useState, useCallback } from "react"; // Added useCallback
import CanvasDraw from "react-canvas-draw";
import {
  BiSave,
  BiSolidEraser,
  BiSolidHand,
  BiSolidPencil,
} from "react-icons/bi";
import { GrRevert } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { MdOutlineFormatClear, MdTextFields } from "react-icons/md";
import { defaultCanvas } from "../../data";
import { useEnterKey } from "../../hook";
import { urlToFile } from "../../utils";
import prase from "html-react-parser";

interface ITextObject {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

type ModeType = "draw" | "mouse" | "text-edit" | "eraser";

function DraggableText({
  obj,
  mode,
  currentTextId,
  handleTextClick,
}: {
  obj: ITextObject;
  mode: ModeType;
  currentTextId: number | null;
  handleTextClick: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(obj.id),
  });

  const style: React.CSSProperties = {
    position: "absolute",
    left: obj.x,
    top: obj.y,
    transform: CSS.Translate.toString(transform),
    border: mode === "mouse" ? "1px dashed #ccc" : "none",
    color: obj.color,
    fontSize: `${obj.fontSize}px`,
    cursor: mode === "mouse" ? "move" : "default",
    // When editing, text should not intercept clicks for dragging itself.
    // Allow interaction if not current text or if mode is not mouse (e.g. to click and start editing)
    pointerEvents:
      currentTextId === obj.id && mode === "text-edit" ? "none" : "auto",
  };
  return (
    <p
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        // Allow double click to edit only in mouse or draw mode for non-active text
        if (mode === "mouse" || mode === "draw") {
          handleTextClick(obj.id);
        }
      }}
      {...attributes}
      {...listeners}
    >
      {prase(obj.text.replace(/\n/g, "<br />"))}
    </p>
  );
}

type Props = {
  imageURL: string;
  name: string;
  id: string;
  onClose: () => void;
  onSave: (data: { file: File; id: string }) => void;
};
const DrawCanva = ({ imageURL, onClose, name, onSave }: Props) => {
  const canvasRef = useRef<
    CanvasDraw & { getDataURL: () => string } & { canvas: { drawing: any } }
  >(null);

  const [image, setImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<ModeType>("mouse");
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushRadius, setBrushRadius] = useState<number>(5);

  const [textObjects, setTextObjects] = useState<ITextObject[]>([]);
  const [textObjectsHistory, setTextObjectsHistory] = useState<ITextObject[][]>(
    [],
  );
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [currentText, setCurrentText] = useState<string>("");
  const [currentTextId, setCurrentTextId] = useState<number | null>(null);

  const [textColor, setTextColor] = useState<string>("#000000");
  const [textSize, setTextSize] = useState<number>(20);

  const [canvasWidth, setCanvasWidth] = useState<number>(1000);
  const [canvasHeight, setCanvasHeight] = useState<number>(1000);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Refs for pinch-to-zoom
  const pinchStartScaleRef = useRef<number>(1);
  const initialPinchDistanceRef = useRef<number>(0);

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      const newScaleValue = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, scale + delta),
      );

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleFactor = newScaleValue / scale;

      const newX = mouseX - scaleFactor * (mouseX - position.x);
      const newY = mouseY - scaleFactor * (mouseY - position.y);

      setScale(newScaleValue);
      setPosition({ x: newX, y: newY });
    },
    [scale, position, MIN_SCALE, MAX_SCALE],
  ); // containerRef.current is not a reactive dependency here

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (
      mode !== "mouse" ||
      isDraggingText === true ||
      initialPinchDistanceRef.current > 0
    ) {
      // Do not pan if pinching
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (
      mode !== "mouse" ||
      isDraggingText === true ||
      initialPinchDistanceRef.current > 0
    ) {
      return;
    }
    if (!isPanning) return;
    setPosition({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Wheel listener
    currentContainer.addEventListener("wheel", handleWheel, { passive: false });

    // Touch listeners for pinch-zoom
    const onTouchStart = (ev: TouchEvent) => {
      if (isDraggingText) return; // Don't interfere with dnd-kit dragging

      if (ev.touches.length === 2 && mode === "mouse") {
        ev.preventDefault();
        const touch1 = ev.touches[0];
        const touch2 = ev.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY,
        );
        initialPinchDistanceRef.current = distance;
        pinchStartScaleRef.current = scale;
        setIsPanning(false); // Prevent mouse-based panning when pinch starts
      }
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (isDraggingText) return;

      if (
        ev.touches.length === 2 &&
        mode === "mouse" &&
        initialPinchDistanceRef.current > 0
      ) {
        ev.preventDefault();
        const touch1 = ev.touches[0];
        const touch2 = ev.touches[1];
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY,
        );

        const rect = currentContainer.getBoundingClientRect();
        if (!rect) return;

        const midpointClientX = (touch1.clientX + touch2.clientX) / 2;
        const midpointClientY = (touch1.clientY + touch2.clientY) / 2;
        const pointerX = midpointClientX - rect.left;
        const pointerY = midpointClientY - rect.top;

        let newScaleTarget =
          pinchStartScaleRef.current *
          (currentDistance / initialPinchDistanceRef.current);
        const newClampedScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, newScaleTarget),
        );

        const scaleFactor = newClampedScale / scale; // `scale` is current state scale

        const newX = pointerX - scaleFactor * (pointerX - position.x);
        const newY = pointerY - scaleFactor * (pointerY - position.y);

        setScale(newClampedScale);
        setPosition({ x: newX, y: newY });
      }
    };

    const onTouchEnd = (ev: TouchEvent) => {
      if (initialPinchDistanceRef.current > 0 && ev.touches.length < 2) {
        initialPinchDistanceRef.current = 0; // Reset pinch state
      }
      // If isPanning was true due to single touch emulating mouse,
      // browser's emulated mouseup should call handleMouseUp.
    };

    currentContainer.addEventListener("touchstart", onTouchStart, {
      passive: false,
    });
    currentContainer.addEventListener("touchmove", onTouchMove, {
      passive: false,
    });
    currentContainer.addEventListener("touchend", onTouchEnd, {
      passive: false,
    });
    currentContainer.addEventListener("touchcancel", onTouchEnd, {
      passive: false,
    });

    return () => {
      currentContainer.removeEventListener("wheel", handleWheel);
      currentContainer.removeEventListener("touchstart", onTouchStart);
      currentContainer.removeEventListener("touchmove", onTouchMove);
      currentContainer.removeEventListener("touchend", onTouchEnd);
      currentContainer.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    handleWheel,
    mode,
    isDraggingText,
    scale,
    position,
    MIN_SCALE,
    MAX_SCALE,
  ]);

  const handleDragStart = () => {
    setIsDraggingText(true);
  };

  useEffect(() => {
    const canvasDraw = canvasRef.current;
    if (!canvasDraw) return;
    const drawingCanvas = canvasDraw.canvas.drawing;
    if (!drawingCanvas) return;
    const ctx = drawingCanvas.getContext("2d");
    if (!ctx) return;

    if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
  }, [mode, image]);

  useEffect(() => {
    handleShowImage();
  }, []); // imageURL is a prop, if it can change, add it to dependency array. Assuming it's initial.

  const handleShowImage = async () => {
    // Consider aborting if component unmounts or imageURL changes rapidly
    setLoadingImage(true);
    const file = await urlToFile(imageURL);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setCanvasWidth(img.width);
          setCanvasHeight(img.height);
          setImage(imageUrl); // This will trigger the other useEffect for eraser mode if image changes
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
    setLoadingImage(false);
  };

  const handleAddText = () => {
    setMode("text-edit");
    const newTextId = Date.now();
    setCurrentTextId(newTextId);
    const initialText = "Add Your Text Here";
    setCurrentText(initialText);
    saveTextObjectsToHistory(); // Save state before adding new text for undo
    setTextObjects((prev) => [
      ...prev,
      {
        id: newTextId,
        text: initialText,
        x: canvasWidth / 2 - position.x / scale, // Adjust for current view
        y: canvasHeight / 2 - position.y / scale, // Adjust for current view
        color: textColor,
        fontSize: textSize,
      },
    ]);

    setTimeout(() => {
      textAreaRef.current?.focus();
      textAreaRef.current?.select();
    }, 100); // Shorter timeout might work
  };

  const handleFinishEditing = () => {
    saveTextObjectsToHistory(); // Save before finishing edit
    setTextObjects((prev) =>
      prev.map((obj) =>
        obj.id === currentTextId
          ? { ...obj, text: currentText, color: textColor, fontSize: textSize }
          : obj,
      ),
    );
    setMode("mouse");
    setCurrentTextId(null);
    setCurrentText("");
  };

  const handleTextClick = (id: number) => {
    if (mode === "draw" || mode === "mouse") {
      const textObj = textObjects.find((obj) => obj.id === id);
      if (textObj) {
        saveTextObjectsToHistory(); // Save state before starting edit for undo
        setMode("text-edit");
        setCurrentTextId(id);
        setCurrentText(textObj.text);
        setTextColor(textObj.color);
        setTextSize(textObj.fontSize);
        setTimeout(() => {
          // Ensure textarea is rendered and then focus
          textAreaRef.current?.focus();
          textAreaRef.current?.select();
        }, 0);
      }
    }
  };

  const saveTextObjectsToHistory = () => {
    setTextObjectsHistory((prev) => [...prev, textObjects]); // textObjects directly
  };

  const handleUndo = () => {
    if (textObjectsHistory.length > 0) {
      const lastState = textObjectsHistory[textObjectsHistory.length - 1];
      setTextObjects(lastState);
      setTextObjectsHistory(textObjectsHistory.slice(0, -1));
    } else {
      // Only undo drawing if no text history to undo
      canvasRef.current?.undo();
    }
  };

  const handleDeleteCurrentText = () => {
    if (currentTextId !== null) {
      saveTextObjectsToHistory();
      setTextObjects((prev) => prev.filter((obj) => obj.id !== currentTextId));
      setMode("mouse"); // Or "draw", depending on desired state after delete
      setCurrentTextId(null);
      setCurrentText("");
    }
  };

  const handleClearAllText = () => {
    if (textObjects.length > 0) {
      saveTextObjectsToHistory();
      setTextObjects([]);
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = canvasWidth;
    finalCanvas.height = canvasHeight;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    const processSave = () => {
      // Draw drawing from react-canvas-draw
      const drawingImage = new Image();
      drawingImage.onload = () => {
        ctx.drawImage(drawingImage, 0, 0);

        // Draw text objects
        textObjects.forEach((obj) => {
          ctx.fillStyle = obj.color;
          ctx.font = `${obj.fontSize}px Arial`; // Consider making font family configurable
          // Handle multiline text
          const lines = obj.text.split("\n");
          lines.forEach((line, index) => {
            ctx.fillText(line, obj.x, obj.y + index * obj.fontSize); // Adjust y for multiline
          });
        });

        finalCanvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], name || "canvas-image.png", {
              type: "image/png",
            });
            onSave({ file, id: name || "canvas-image" }); // Ensure `name` prop is a valid filename part or provide default
          }
        }, "image/png");
      };
      drawingImage.onerror = () =>
        console.error("Error loading drawing image for saving.");
      drawingImage.src = canvasRef.current?.getDataURL() || "";
    };

    // Draw background image first if it exists
    if (image) {
      const backgroundImage = new Image();
      backgroundImage.onload = () => {
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
        processSave(); // Proceed to draw drawings and text
      };
      backgroundImage.onerror = () => {
        console.error("Error loading background image for saving.");
        processSave(); // Proceed without background if it fails
      };
      backgroundImage.src = image;
    } else {
      processSave(); // No background image, just draw drawings and text
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 }, // Small distance to allow clicks on text without starting drag
  });
  const sensors = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const activeId = Number(active.id);
    saveTextObjectsToHistory(); // Save state before drag for undo
    setTextObjects((prev) =>
      prev.map((obj) =>
        obj.id === activeId
          ? { ...obj, x: obj.x + delta.x, y: obj.y + delta.y }
          : obj,
      ),
    );
    setIsDraggingText(false);
  };

  const isCanvasDisabled = mode !== "draw" && mode !== "eraser";

  useEnterKey(() => {
    if (mode === "text-edit") {
      handleFinishEditing();
    }
  });

  return (
    <div className="flex h-full w-full flex-col items-center bg-gray-200">
      {loadingImage && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-20 flex h-full w-full items-center justify-center bg-white/80 backdrop-blur-sm">
          Loading..
        </div>
      )}
      {/* Top Bar */}
      <div className="gradient-bg flex w-full items-center justify-between gap-2 border-b px-5 py-2 pl-10">
        <div className="flex h-full items-center justify-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <ImageNextJs
              src="/favicon.ico" // Replace with your actual logo
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              alt="logo tatuga school"
            />
          </div>
          <div className="h-5/6 w-[0.5px] bg-white" />
          <button
            type="button"
            title="Undo"
            onClick={handleUndo}
            className="flex h-10 w-20 items-center justify-center rounded-md border text-xl font-normal text-white hover:bg-gray-100/10"
          >
            <GrRevert />
          </button>
          <button
            type="button"
            title="Save Image"
            onClick={handleSave}
            className="flex h-10 w-28 items-center justify-center gap-1 rounded-lg border bg-white text-black hover:bg-sky-200 active:scale-105"
          >
            <BiSave />
            SAVE
          </button>
        </div>
        <div className="flex items-center justify-center gap-5">
          <h1 className="hideScrollBar max-w-96 overflow-auto text-right text-lg font-medium text-white">
            {name}
          </h1>
          <button
            onClick={() => onClose()}
            className="flex h-6 w-6 items-center justify-center rounded border border-white text-lg text-white hover:bg-white hover:text-black"
          >
            <IoMdClose />
          </button>
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="fixed top-20 z-20 flex items-center space-x-2 rounded-lg bg-white px-2 py-1 drop-shadow-lg">
        {mode !== "text-edit" && (
          <>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="ml-2 h-7 w-7 cursor-pointer appearance-none border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
              title="Brush Color"
            />
            <label className="flex items-center">
              <input
                type="range"
                min="1"
                max="50"
                value={brushRadius}
                onChange={(e) => setBrushRadius(Number(e.target.value))}
                className="ml-1 w-20 cursor-pointer"
                title={`Brush Size: ${brushRadius}`}
              />
            </label>
            <button
              title="Draw Mode"
              type="button"
              className={` ${mode === "draw" ? "bg-sky-200" : "bg-gray-100"} flex h-7 w-7 items-center justify-center rounded-lg border text-black hover:bg-sky-200 active:scale-105`}
              onClick={() => {
                setScale(1); // Optional: reset zoom when switching to draw
                setMode("draw");
              }}
            >
              <BiSolidPencil />
            </button>
            <button
              title="Mouse Mode (Pan/Zoom/Select Text)"
              type="button"
              onClick={() => setMode("mouse")}
              className={` ${mode === "mouse" ? "bg-sky-200" : "bg-gray-100"} flex h-7 w-7 items-center justify-center rounded-lg border text-black hover:bg-sky-200 active:scale-105`}
            >
              <BiSolidHand />
            </button>
            <button
              title="Eraser Mode"
              type="button"
              onClick={() => setMode("eraser")}
              className={` ${mode === "eraser" ? "bg-sky-200" : "bg-gray-100"} flex h-7 w-7 items-center justify-center rounded-lg border text-black hover:bg-sky-200 active:scale-105`}
            >
              <BiSolidEraser />
            </button>
            <button
              title="Add Text"
              type="button"
              onClick={handleAddText}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border bg-gray-100 text-black hover:bg-sky-200 active:scale-105`}
            >
              <MdTextFields />
            </button>
            <button
              title="Clear All Text"
              type="button"
              onClick={handleClearAllText}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border bg-gray-100 text-black hover:bg-sky-200 active:scale-105`}
            >
              <MdOutlineFormatClear />
            </button>
            <button
              title="Clear All Drawing"
              type="button"
              onClick={() => canvasRef.current?.clear()}
              className={`relative flex h-7 w-7 items-center justify-center rounded-lg border bg-gray-100 text-black hover:bg-sky-200 active:scale-105`}
            >
              <div className="absolute h-5 w-[1.5px] -rotate-45 bg-black" />
              <BiSolidPencil />
            </button>
          </>
        )}

        {mode === "text-edit" && currentTextId !== null && (
          <>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setTextColor(newColor);
                // Update live without needing full history save yet, or save on change
                setTextObjects((prev) =>
                  prev.map((obj) =>
                    obj.id === currentTextId
                      ? { ...obj, color: newColor }
                      : obj,
                  ),
                );
              }}
              className="ml-2 h-7 w-7 cursor-pointer appearance-none border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
              title="Text Color"
            />
            <label className="flex items-center">
              Text Size:
              <input
                type="number" // Changed to number for easier input
                min="10"
                max="100" // Reasonable max
                value={textSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  if (newSize >= 10 && newSize <= 100) {
                    // Basic validation
                    setTextSize(newSize);
                    setTextObjects((prev) =>
                      prev.map((obj) =>
                        obj.id === currentTextId
                          ? { ...obj, fontSize: newSize }
                          : obj,
                      ),
                    );
                  }
                }}
                className="ml-1 w-16 rounded border px-1 text-center"
              />
            </label>
            <button
              type="button"
              onClick={handleFinishEditing}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handleDeleteCurrentText}
              className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Important to stop panning if mouse leaves container
        style={{
          width: "100vw",
          height: "calc(100vh - 5rem)", // Adjust based on your top bar and toolbar height
          overflow: "hidden",
          cursor:
            mode === "mouse" && !isDraggingText
              ? isPanning
                ? "grabbing"
                : "grab"
              : "default",
          touchAction: "none", // Essential for preventing browser default touch actions like scroll/zoom on this element
        }}
        className="mt-16" // Adjust if toolbar height changes
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="relative" // Removed explicit background color to let CanvasDraw or image show
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              width: canvasWidth,
              height: canvasHeight,
              border: "1px solid #ccc", // Border for visual aid of canvas boundary
              background: "#fff", // Add white background to ensure it's not transparent when no image
            }}
          >
            {mode === "text-edit" &&
              currentTextId !== null &&
              (() => {
                const currentTextObj = textObjects.find(
                  (t) => t.id === currentTextId,
                );
                if (!currentTextObj) return null;
                return (
                  <div
                    style={{
                      position: "absolute",
                      left: currentTextObj.x,
                      top: currentTextObj.y,
                      // transform: `scale(${1 / scale})`, // Counter-scale if needed, or style textarea directly
                      // transformOrigin: "0 0",
                      zIndex: 50,
                    }}
                  >
                    <textarea
                      ref={textAreaRef}
                      value={currentText}
                      style={{
                        fontSize: `${currentTextObj.fontSize}px`, // Use actual object's size for consistency
                        color: currentTextObj.color,
                        lineHeight: `${currentTextObj.fontSize * 1.2}px`, // Adjust line height
                        border: "1px dashed blue", // Visual cue for editing
                        background: "rgba(255, 255, 255, 0.8)",
                        resize: "none", // Or allow resize if desired
                        outline: "none",
                      }}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setCurrentText(newText);
                        setTextObjects((prev) =>
                          prev.map((obj) =>
                            obj.id === currentTextId
                              ? { ...obj, text: newText }
                              : obj,
                          ),
                        );
                      }}
                      onBlur={handleFinishEditing} // Optionally finish editing on blur
                      className="p-1" // Removed resize-none, appearance-none
                      rows={Math.max(3, currentText.split("\n").length)} // Auto adjust rows
                      cols={40} // Default cols
                    />
                  </div>
                );
              })()}

            {image && (
              <img
                ref={imageRef}
                src={image}
                alt="Canvas background"
                className="absolute left-0 top-0 h-full w-full"
                style={{ pointerEvents: "none" }} // Image should not intercept mouse events
              />
            )}
            <CanvasDraw
              ref={canvasRef}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              brushColor={brushColor}
              brushRadius={brushRadius}
              hideGrid={true}
              lazyRadius={0}
              backgroundColor="#00"
              disabled={isCanvasDisabled}
              className={mode === "mouse" ? "cursor-grab" : ""} // visual cue for mouse mode
            />
            {textObjects
              .filter((text) => text.id !== currentTextId) // Don't render active text as DraggableText, it's in textarea
              .map((obj) => (
                <DraggableText
                  key={obj.id}
                  obj={obj}
                  mode={mode}
                  currentTextId={currentTextId}
                  handleTextClick={handleTextClick}
                />
              ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default DrawCanva;
