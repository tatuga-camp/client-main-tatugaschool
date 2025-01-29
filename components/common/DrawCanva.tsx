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
          : obj
      )
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
          : obj
      )
    );
  };

  // ถ้าไม่ใช่ draw/eraser => disable canvas
  const isCanvasDisabled = mode !== "draw" && mode !== "eraser";

  useEnterKey(() => {
    if (mode === "text-edit") {
      handleFinishEditing();
    }
  });

  return (
    <div className="flex w-full h-full grow gap-2 bg-gray-200 flex-col items-center">
      <div className="w-full gradient-bg  border-b h-14 px-5 items-center flex gap-2 pl-10 justify-between">
        <div className="flex h-full items-center justify-center gap-2">
          <div
            className="w-10 h-10 rounded-md overflow-hidden ring-1 ring-white
                 relative hover:scale-105 active:scale-110 transition duration-150"
          >
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
            className=" text-white text-xl border font-normal w-20 hover:bg-gray-100/10 
            h-10 rounded-md flex items-center justify-center"
          >
            <GrRevert />
          </button>
          <button
            type="button"
            title="Save Image"
            onClick={handleSave}
            className="text-black flex 
          hover:bg-sky-200 active:scale-105
          items-center justify-center gap-1 w-28 h-10 rounded-lg border  bg-white"
          >
            <BiSave />
            SAVE
          </button>
        </div>
        <div className="flex items-center justify-center gap-5">
          <h1 className="text-white text-lg font-medium text-right max-w-96 overflow-auto hideScrollBar ">
            {name}
          </h1>
          <button
            onClick={() => onClose()}
            className="text-lg text-white hover:text-black  hover:bg-white w-6  border border-white  h-6 
                rounded flex items-center justify-center"
          >
            <IoMdClose />
          </button>
        </div>
      </div>

      <div className="flex space-x-2 bg-white px-2 py-1 rounded-lg drop-shadow-lg items-center  mt-4">
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
              className={`
            ${mode === "draw" ? "bg-sky-200" : "bg-gray-100 "}
            text-black w-7 h-7 rounded-lg border active:scale-105
           flex items-center justify-center hover:bg-sky-200`}
              onClick={() => setMode("draw")}
            >
              <BiSolidPencil />
            </button>
            <button
              title="Mouse Mode"
              type="button"
              onClick={() => setMode("mouse")}
              className={`
            ${mode === "mouse" ? "bg-sky-200" : "bg-gray-100 "}
            text-black w-7 h-7 rounded-lg border active:scale-105
           flex items-center justify-center hover:bg-sky-200`}
            >
              <BiSolidHand />
            </button>
            <button
              title="Eraser Mode"
              type="button"
              onClick={() => setMode("eraser")}
              className={`
            ${mode === "eraser" ? "bg-sky-200" : "bg-gray-100 "}
            text-black w-7 h-7 rounded-lg border active:scale-105
           flex items-center justify-center hover:bg-sky-200`}
            >
              <BiSolidEraser />
            </button>
            <button
              title="Add Text"
              type="button"
              onClick={handleAddText}
              className={`
           bg-gray-100
            text-black w-7 h-7 rounded-lg border active:scale-105
           flex items-center justify-center hover:bg-sky-200`}
            >
              <MdTextFields />
            </button>
            <button
              title="Clear All Text"
              type="button"
              onClick={handleClearAllText}
              className={`
          bg-gray-100
            text-black w-7 h-7 rounded-lg border active:scale-105
           flex items-center justify-center hover:bg-sky-200`}
            >
              <MdOutlineFormatClear />
            </button>
            <button
              title="Clear All Drawing"
              type="button"
              onClick={() => canvasRef.current?.clear()}
              className={`
          bg-gray-100
            text-black w-7 relative h-7 rounded-lg border active:scale-105
           flex items-center justify-center hover:bg-sky-200`}
            >
              <div className="h-5 w-[1.5px] bg-black absolute -rotate-45" />
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
                      : obj
                  )
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
                        : obj
                    )
                  );
                }}
                className="ml-2 border w-16"
              />
            </label>
            <button
              type="button"
              onClick={handleFinishEditing}
              className="p-2 bg-blue-500 text-white"
            >
              Done Editing
            </button>
            <button
              type="button"
              onClick={handleDeleteCurrentText}
              className="p-2 bg-red-500 text-white"
            >
              Delete This Text
            </button>{" "}
          </>
        )}
      </div>

      <div className="w-9/12  bg-slate-50  overflow-auto">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {/* Container สำหรับซ้อนรูปพื้นหลัง + CanvasDraw (โปร่งใส) */}
          <div
            className="relative"
            style={{ width: canvasWidth, height: canvasHeight }}
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
                          : obj
                      )
                    );
                  }}
                  className=" border border-dashed bg-white/40 p-1 
                   appearance-none active:outline-none resize-none focus:outline-none "
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
