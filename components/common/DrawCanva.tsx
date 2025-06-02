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
import React, { useEffect, useRef, useState } from "react";
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
    pointerEvents: currentTextId === obj.id ? "none" : "auto",
  };
  return (
    <p
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        handleTextClick(obj.id);
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

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3;

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = newScale / scale;

    const newX = mouseX - scaleFactor * (mouseX - position.x);
    const newY = mouseY - scaleFactor * (mouseY - position.y);

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (mode !== "mouse" || isDraggingText === true) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (mode !== "mouse" || isDraggingText === true) {
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
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scale, position]);

  const handleDragStart = () => {
    setIsDraggingText(true);
  };

  // สำคัญ: ให้ effect นี้รันซ้ำทั้งตอน mode เปลี่ยน และ image เปลี่ยน (เช่นหลังอัปโหลดรูป)
  useEffect(() => {
    const canvasDraw = canvasRef.current;
    if (!canvasDraw) return;

    const drawingCanvas = canvasDraw.canvas.drawing;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext("2d");
    if (!ctx) return;

    if (mode === "eraser") {
      // ลบเส้นด้วย destination-out
      ctx.globalCompositeOperation = "destination-out";
    } else {
      // วาดปกติ
      ctx.globalCompositeOperation = "source-over";
    }
  }, [mode, image]);

  useEffect(() => {
    handleShowImage();
  }, []);

  const handleShowImage = async () => {
    const file = await urlToFile(imageURL);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setCanvasWidth(img.width);
          setCanvasHeight(img.height);
          setImage(imageUrl);
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    setMode("text-edit");
    const newTextId = Date.now();
    setCurrentTextId(newTextId);
    setCurrentText("Add Your Text Here");
    saveTextObjectsToHistory();
    setTextObjects((prev) => [
      ...prev,
      {
        id: newTextId,
        text: "Add Your Text Here",
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        color: textColor,
        fontSize: textSize,
      },
    ]);

    setTimeout(() => {
      textAreaRef.current?.focus();
    }, 250);
  };

  const handleFinishEditing = () => {
    saveTextObjectsToHistory();
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
    // ให้แก้ไขข้อความได้หากเป็น draw/mouse
    if (mode === "draw" || mode === "mouse") {
      setMode("text-edit");
      setCurrentTextId(id);
      const textObj = textObjects.find((obj) => obj.id === id);
      if (textObj) {
        setCurrentText(textObj.text);
        setTextColor(textObj.color);
        setTextSize(textObj.fontSize);
      }
    }
  };

  const saveTextObjectsToHistory = () => {
    setTextObjectsHistory((prev) => [...prev, [...textObjects]]);
  };

  const handleUndo = () => {
    if (textObjectsHistory.length > 0) {
      const lastState = textObjectsHistory[textObjectsHistory.length - 1];
      setTextObjects(lastState);
      setTextObjectsHistory(textObjectsHistory.slice(0, -1));
    } else {
      canvasRef.current?.undo();
    }
  };

  const handleDeleteCurrentText = () => {
    if (currentTextId !== null) {
      saveTextObjectsToHistory();
      setTextObjects((prev) => prev.filter((obj) => obj.id !== currentTextId));
      setMode("draw");
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

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    // วาดรูปพื้นหลัง
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        // วาดลายเส้น (canvasRef)
        const drawing = new Image();
        drawing.src = canvasRef.current?.getDataURL() || "";
        drawing.onload = () => {
          context.drawImage(drawing, 0, 0);
          // วาด text
          drawTexts(context);
        };
      };
    } else {
      // ถ้าไม่มีภาพ ก็วาดแค่ลายเส้นกับข้อความ
      const drawing = new Image();
      drawing.src = canvasRef.current?.getDataURL() || "";
      drawing.onload = () => {
        context.drawImage(drawing, 0, 0);
        drawTexts(context);
      };
    }
  };

  const drawTexts = async (context: CanvasRenderingContext2D) => {
    textObjects.forEach((obj) => {
      context.fillStyle = obj.color;
      context.font = `${obj.fontSize}px Arial`;
      context.fillText(obj.text, obj.x, obj.y);
    });
    // แปลงเป็นรูปแล้วดาวน์โหลด
    const newImage = context.canvas.toDataURL("image/png");
    const file = await urlToFile(newImage, name);
    if (file) {
      onSave({ file, id: name });
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const activeId = Number(active.id);
    setTextObjects((prev) =>
      prev.map((obj) =>
        obj.id === activeId
          ? { ...obj, x: obj.x + delta.x, y: obj.y + delta.y }
          : obj,
      ),
    );
    setIsDraggingText(false);
  };

  // ถ้าไม่ใช่ draw/eraser => disable canvas
  const isCanvasDisabled = mode !== "draw" && mode !== "eraser";

  useEnterKey(() => {
    if (mode === "text-edit") {
      handleFinishEditing();
    }
  });

  return (
    <div className="flex h-full w-full flex-col items-center bg-gray-200">
      <div className="gradient-bg flex w-full items-center justify-between gap-2 border-b px-5 py-2 pl-10">
        <div className="flex h-full items-center justify-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <ImageNextJs
              src="/favicon.ico"
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

      <div className="fixed top-20 z-20 flex items-center space-x-2 rounded-lg bg-white px-2 py-1 drop-shadow-lg">
        {mode !== "text-edit" && (
          <>
            {" "}
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="ml-2"
            />
            <label>
              Brush Size:
              <input
                type="range"
                min="1"
                max="50"
                value={brushRadius}
                onChange={(e) => setBrushRadius(Number(e.target.value))}
                className="ml-2"
              />
            </label>
            <button
              title="Draw Mode"
              type="button"
              className={` ${mode === "draw" ? "bg-sky-200" : "bg-gray-100"} flex h-7 w-7 items-center justify-center rounded-lg border text-black hover:bg-sky-200 active:scale-105`}
              onClick={() => {
                setScale(1);
                setMode("draw");
              }}
            >
              <BiSolidPencil />
            </button>
            <button
              title="Mouse Mode"
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

        {mode === "text-edit" && (
          <>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const color = e.target.value;
                setTextColor(color);
                saveTextObjectsToHistory();
                setTextObjects((prev) =>
                  prev.map((obj) =>
                    obj.id === currentTextId
                      ? {
                          ...obj,
                          color: color,
                        }
                      : obj,
                  ),
                );
              }}
              className="ml-2"
            />
            <label>
              Text Size:
              <input
                type="number"
                min="10"
                max="100"
                value={textSize}
                onChange={(e) => {
                  const size = Number(e.target.value);
                  setTextSize(size);
                  saveTextObjectsToHistory();
                  setTextObjects((prev) =>
                    prev.map((obj) =>
                      obj.id === currentTextId
                        ? {
                            ...obj,
                            fontSize: size,
                          }
                        : obj,
                    ),
                  );
                }}
                className="ml-2 w-16 border"
              />
            </label>
            <button
              type="button"
              onClick={handleFinishEditing}
              className="bg-blue-500 p-2 text-white"
            >
              Done Editing
            </button>
            <button
              type="button"
              onClick={handleDeleteCurrentText}
              className="bg-red-500 p-2 text-white"
            >
              Delete This Text
            </button>{" "}
          </>
        )}
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Container สำหรับซ้อนรูปพื้นหลัง + CanvasDraw (โปร่งใส) */}
          <div
            className="relative"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              width: canvasWidth,
              height: canvasHeight,
              background: "#fff",
              border: "1px solid #ccc",
            }}
          >
            {mode === "text-edit" && (
              <div
                style={{
                  left: textObjects.find((text) => text.id === currentTextId)
                    ?.x,
                  top: textObjects.find((text) => text.id === currentTextId)?.y,
                }}
                className="absolute z-50"
              >
                <textarea
                  ref={textAreaRef}
                  value={currentText}
                  style={{
                    fontSize: `${
                      textObjects.find((text) => text.id === currentTextId)
                        ?.fontSize
                    }px`,
                    color: `${
                      textObjects.find((text) => text.id === currentTextId)
                        ?.color
                    }`,
                  }}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCurrentText(text);
                    saveTextObjectsToHistory();
                    setTextObjects((prev) =>
                      prev.map((obj) =>
                        obj.id === currentTextId
                          ? {
                              ...obj,
                              text: text,
                            }
                          : obj,
                      ),
                    );
                  }}
                  className="resize-none appearance-none border border-dashed bg-white/40 p-1 focus:outline-none active:outline-none"
                  rows={3}
                  cols={40}
                />
              </div>
            )}
            {/* รูปพื้นหลัง */}
            {image && (
              <img
                ref={imageRef}
                src={image}
                alt="Selected"
                className="absolute left-0 top-0 h-full w-full"
              />
            )}
            {/* CanvasDraw โปร่งใส วางข้างบน */}
            <CanvasDraw
              ref={canvasRef}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              brushColor={brushColor}
              brushRadius={brushRadius}
              hideGrid={true}
              lazyRadius={0}
              disabled={isCanvasDisabled}
            />
            {/* ข้อความที่ลากได้ */}
            {textObjects
              .filter((text) => text.id !== currentTextId)
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
