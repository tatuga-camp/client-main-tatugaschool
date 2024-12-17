import React, { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import { Rnd } from "react-rnd";

const DrawCanva = () => {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<CanvasDraw>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // โหมด: 'draw' หรือ 'text-edit'
  const [mode, setMode] = useState<'draw' | 'text-edit'>('draw');

  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushRadius, setBrushRadius] = useState<number>(5);

  // เก็บข้อความทั้งหมด
  const [textObjects, setTextObjects] = useState<Array<{
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
  }>>([]);

  // สแต็กสำหรับเก็บสถานะของข้อความ
  const [textObjectsHistory, setTextObjectsHistory] = useState<Array<Array<{
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
  }>>>([]);

  const [currentText, setCurrentText] = useState<string>("");
  const [currentTextId, setCurrentTextId] = useState<number | null>(null);

  const [textColor, setTextColor] = useState<string>("#000000");
  const [textSize, setTextSize] = useState<number>(20);

  const canvasWidth = 1000;
  const canvasHeight = 1000;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // เพิ่มข้อความใหม่
  const handleAddText = () => {
    setMode('text-edit');
    const newTextId = Date.now();
    setCurrentTextId(newTextId);
    setCurrentText("");
    saveTextObjectsToHistory();
    setTextObjects([...textObjects, {
      id: newTextId,
      text: "",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      color: textColor,
      fontSize: textSize,
    }]);
  };

  // ยืนยันการแก้ไขข้อความ
  const handleFinishEditing = () => {
    saveTextObjectsToHistory();
    setTextObjects(textObjects.map(obj => {
      if (obj.id === currentTextId) {
        return {
          ...obj,
          text: currentText,
          color: textColor,
          fontSize: textSize,
        };
      }
      return obj;
    }));
    setMode('draw');
    setCurrentTextId(null);
    setCurrentText("");
  };

  // จัดการการลากข้อความ
  const handleTextDrag = (e: any, data: any, id: number) => {
    setTextObjects(textObjects.map(obj => {
      if (obj.id === id) {
        return {
          ...obj,
          x: data.x,
          y: data.y,
        };
      }
      return obj;
    }));
  };

  // เมื่อคลิกที่ข้อความในโหมดวาด
  const handleTextClick = (id: number) => {
    if (mode === 'draw') {
      setMode('text-edit');
      setCurrentTextId(id);
      const textObj = textObjects.find(obj => obj.id === id);
      if (textObj) {
        setCurrentText(textObj.text);
        setTextColor(textObj.color);
        setTextSize(textObj.fontSize);
      }
    }
  };

  // บันทึกสถานะของข้อความลงในสแต็ก
  const saveTextObjectsToHistory = () => {
    setTextObjectsHistory([...textObjectsHistory, [...textObjects]]);
  };

  // ย้อนกลับสถานะของข้อความ
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
        // วาดภาพต้นฉบับ
        if (image) {
          const img = new Image();
          img.src = image;
          img.onload = () => {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            // วาดการวาดของผู้ใช้
            const drawing = new Image();
            drawing.src = canvasRef.current?.getDataURL() || "";
            drawing.onload = () => {
              context.drawImage(drawing, 0, 0);

              // วาดข้อความ
              textObjects.forEach(obj => {
                context.fillStyle = obj.color;
                context.font = `${obj.fontSize}px Arial`;
                context.fillText(obj.text, obj.x, obj.y);
              });

              // บันทึกภาพ
              const newImage = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.href = newImage;
              link.download = "merged-image.png";
              link.click();
            };
          };
        } else {
          // ไม่มีภาพพื้นหลัง
          const drawing = new Image();
          drawing.src = canvasRef.current?.getDataURL() || "";
          drawing.onload = () => {
            context.drawImage(drawing, 0, 0);

            textObjects.forEach(obj => {
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

      {mode === 'text-edit' && (
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
        </div>
      )}

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
          <Rnd
            key={obj.id}
            position={{ x: obj.x, y: obj.y }}
            onDragStop={(e, d) => handleTextDrag(e, d, obj.id)}
            enableResizing={false}
            disableDragging={mode !== 'draw'}
            style={{
              border: mode === 'draw' ? '1px dashed #ccc' : 'none',
            }}
          >
            <div
              onDoubleClick={() => handleTextClick(obj.id)}
              style={{
                color: obj.color,
                fontSize: `${obj.fontSize}px`,
                cursor: mode === 'draw' ? 'move' : 'default',
                pointerEvents: currentTextId === obj.id ? 'none' : 'auto',
              }}
            >
              {obj.text}
            </div>
          </Rnd>
        ))}
      </div>

      <button onClick={handleSave} className="mt-4 p-2 bg-blue-500 text-white">
        Save Changes
      </button>
      <button
        onClick={() => canvasRef.current?.clear()}
        className="mt-4 p-2 bg-red-500 text-white"
      >
        Clear Drawing
      </button>
      <button onClick={() => setImage(null)} className="mt-4 p-2 bg-yellow-500 text-white">
        Clear Image
      </button>
      <button onClick={handleUndo} className="mt-4 p-2 bg-gray-500 text-white">
        Undo
      </button>
    </div>
  );
};

export default DrawCanva;