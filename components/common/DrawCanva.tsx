import React, { useRef, useState } from "react";
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

function DraggableText({
  obj,
  mode,
  currentTextId,
  handleTextClick,
}: {
  obj: ITextObject;
  mode: ModeCanva;
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
    border: mode === "draw" ? "1px dashed #ccc" : "none",
    color: obj.color,
    fontSize: `${obj.fontSize}px`,
    cursor: mode === "draw" ? "move" : "default",
    pointerEvents: currentTextId === obj.id ? "none" : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => handleTextClick(obj.id)}
      {...attributes}
      {...listeners}
    >
      {obj.text}
    </div>
  );
}

type ModeCanva = "default" | "draw" | "text-edit";
const DrawCanva = () => {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<CanvasDraw & { getDataURL(): string }>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  const [mode, setMode] = useState<ModeCanva>("default");

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
    if (mode === "draw") {
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

  const handleSave = () => {
    if (canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");

      if (context) {
        if (image) {
          const img = new Image();
          img.src = image;
          img.onload = () => {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            const drawing = new Image();
            drawing.src = canvasRef.current?.getDataURL() || "";
            drawing.onload = () => {
              context.drawImage(drawing, 0, 0);

              textObjects.forEach((obj) => {
                context.fillStyle = obj.color;
                context.font = `${obj.fontSize}px Arial`;
                context.fillText(obj.text, obj.x, obj.y);
              });

              const newImage = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.href = newImage;
              link.download = "merged-image.png";
              link.click();
            };
          };
        } else {
          const drawing = new Image();
          drawing.src = canvasRef.current?.getDataURL() || "";
          drawing.onload = () => {
            context.drawImage(drawing, 0, 0);

            textObjects.forEach((obj) => {
              context.fillStyle = obj.color;
              context.font = `${obj.fontSize}px Arial`;
              context.fillText(obj.text, obj.x, obj.y);
            });

            const newImage = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = newImage;
            link.download = "merged-image.png";
            link.click();
          };
        }
      }
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
      prev.map((obj) => {
        if (obj.id === activeId) {
          return { ...obj, x: obj.x + delta.x, y: obj.y + delta.y };
        }
        return obj;
      })
    );
  };

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
          <button
            onClick={handleFinishEditing}
            className="p-2 bg-blue-500 text-white"
          >
            Done Editing
          </button>
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          className="relative mt-4"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
          {image && (
            <img
              ref={imageRef}
              src={image}
              alt="Selected"
              className="absolute top-0 left-0 w-full h-full"
            />
          )}

          <CanvasDraw
            ref={canvasRef}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            brushColor={brushColor}
            brushRadius={brushRadius}
            className="border"
            hideGrid={true}
            lazyRadius={0}
          />

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

      <button onClick={handleSave} className="mt-4 p-2 bg-blue-500 text-white">
        Save Changes
      </button>
      <button
        onClick={() => canvasRef.current?.clear()}
        className="mt-4 p-2 bg-red-500 text-white"
      >
        Clear Drawing
      </button>
      <button
        onClick={() => setImage(null)}
        className="mt-4 p-2 bg-yellow-500 text-white"
      >
        Clear Image
      </button>
      <button onClick={handleUndo} className="mt-4 p-2 bg-gray-500 text-white">
        Undo
      </button>
    </div>
  );
};

export default DrawCanva;
