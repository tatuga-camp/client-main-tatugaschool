import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";

import {
  DndContext,
  useDraggable,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        handleTextClick(obj.id);
      }}
      {...attributes}
      {...listeners}
    >
      {obj.text}
    </div>
  );
}

type ModeCanva = "default" | "draw" | "text-edit";
const DrawCanva = () => {
  const canvasRef = useRef<CanvasDraw>(null);

  const [image, setImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [mode, setMode] = useState<ModeType>("draw");

  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushRadius, setBrushRadius] = useState<number>(5);

  const [textObjects, setTextObjects] = useState<ITextObject[]>([]);
  const [textObjectsHistory, setTextObjectsHistory] = useState<ITextObject[][]>(
    []
  );

  const [currentText, setCurrentText] = useState<string>("");
  const [currentTextId, setCurrentTextId] = useState<number | null>(null);

  const [textColor, setTextColor] = useState<string>("#000000");
  const [textSize, setTextSize] = useState<number>(20);

  const [canvasWidth, setCanvasWidth] = useState<number>(1000);
  const [canvasHeight, setCanvasHeight] = useState<number>(1000);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
    setCurrentText("");
    saveTextObjectsToHistory();
    setTextObjects((prev) => [
      ...prev,
      {
        id: newTextId,
        text: "",
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        color: textColor,
        fontSize: textSize,
      },
    ]);
  };

  const handleFinishEditing = () => {
    saveTextObjectsToHistory();
    setTextObjects((prev) =>
      prev.map((obj) =>
        obj.id === currentTextId
          ? { ...obj, text: currentText, color: textColor, fontSize: textSize }
          : obj
      )
    );
    setMode("draw");
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
      const lastState =
        textObjectsHistory[textObjectsHistory.length - 1];
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

  const drawTexts = (context: CanvasRenderingContext2D) => {
    textObjects.forEach((obj) => {
      context.fillStyle = obj.color;
      context.font = `${obj.fontSize}px Arial`;
      context.fillText(obj.text, obj.x, obj.y);
    });
    // แปลงเป็นรูปแล้วดาวน์โหลด
    const newImage = context.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = newImage;
    link.download = "merged-image.png";
    link.click();
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
          : obj
      )
    );
  };

  // ถ้าไม่ใช่ draw/eraser => disable canvas
  const isCanvasDisabled = mode !== "draw" && mode !== "eraser";

  return (
    <div className="flex flex-col items-center">
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <div className="flex space-x-2 mt-4">
        <label>
          Brush Color:
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="ml-2"
          />
        </label>
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

        <button onClick={() => setMode("draw")} className="p-2 bg-blue-500 text-white">
          Draw Mode
        </button>
        <button onClick={() => setMode("mouse")} className="p-2 bg-yellow-500 text-white">
          Mouse Mode
        </button>
        <button onClick={() => setMode("eraser")} className="p-2 bg-red-400 text-white">
          Eraser Mode
        </button>
        <button onClick={handleAddText} className="p-2 bg-green-500 text-white">
          Add Text
        </button>
      </div>

      {mode === "text-edit" && (
        <div className="flex space-x-2 mt-4">
          <label>
            Text:
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="ml-2 border"
              rows={3}
              cols={40}
            />
          </label>
          <label>
            Text Color:
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="ml-2"
            />
          </label>
          <label>
            Text Size:
            <input
              type="number"
              min="10"
              max="100"
              value={textSize}
              onChange={(e) => setTextSize(Number(e.target.value))}
              className="ml-2 border w-16"
            />
          </label>
          <button onClick={handleFinishEditing} className="p-2 bg-blue-500 text-white">
            Done Editing
          </button>
          <button onClick={handleDeleteCurrentText} className="p-2 bg-red-500 text-white">
            Delete This Text
          </button>
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Container สำหรับซ้อนรูปพื้นหลัง + CanvasDraw (โปร่งใส) */}
        <div
          className="relative mt-4"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
          {/* รูปพื้นหลัง */}
          {image && (
            <img
              ref={imageRef}
              src={image}
              alt="Selected"
              className="absolute top-0 left-0 w-full h-full"
            />
          )}

          {/* CanvasDraw โปร่งใส วางข้างบน */}
          <CanvasDraw
            ref={canvasRef}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            brushColor={brushColor}
            brushRadius={brushRadius}
            className="border"
            hideGrid={true}
            lazyRadius={0}
            backgroundColor="rgba(0,0,0,0)"
            disabled={isCanvasDisabled}
          />

          {/* ข้อความที่ลากได้ */}
          {textObjects.map((obj) => (
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

      <div className="mt-4 flex space-x-2">
        <button onClick={handleSave} className="p-2 bg-blue-500 text-white">
          Save Merged
        </button>
        <button
          onClick={() => canvasRef.current?.clear()}
          className="p-2 bg-red-500 text-white"
        >
          Clear Drawing
        </button>
        <button
          onClick={() => setImage(null)}
          className="p-2 bg-yellow-500 text-white"
        >
          Clear Image
        </button>
        <button onClick={handleClearAllText} className="p-2 bg-pink-500 text-white">
          Clear All Text
        </button>
        <button onClick={handleUndo} className="p-2 bg-gray-500 text-white">
          Undo
        </button>
      </div>
    </div>
  );
};

export default DrawCanva;
