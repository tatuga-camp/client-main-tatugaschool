import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import CanvasDraw from "react-canvas-draw";

const DrawCanva = () => {
    const [image, setImage] = useState<string | null>(null);
    const canvasRef = useRef<CanvasDraw>(null);
    const imageRef = useRef<HTMLImageElement>(null);

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

    const handleSave = async () => {
        if (canvasRef.current && imageRef.current) {
            const saveData = canvasRef.current.getSaveData();
            const canvas = document.createElement("canvas");
            canvas.width = 500;
            canvas.height = 500;
            const context = canvas.getContext("2d");

            if (context && imageRef.current) {
                // Draw the original image on the canvas
                const img = new Image();
                img.src = imageRef.current.src;
                img.onload = () => {
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Draw the user's drawing on top of the original image
                    const drawingCanvas = document.createElement("canvas");
                    drawingCanvas.width = 500;
                    drawingCanvas.height = 500;
                    const drawingContext = drawingCanvas.getContext("2d");

                    if (drawingContext) {
                        const imgData = new Image();
                        imgData.src = saveData;
                        imgData.onload = () => {
                            drawingContext.drawImage(imgData, 0, 0);
                            context.drawImage(drawingCanvas, 0, 0);

                            // Convert the canvas to an image
                            html2canvas(canvas).then((canvas) => {
                                const newImage = canvas.toDataURL("image/png");
                                const link = document.createElement("a");
                                link.href = newImage;
                                link.download = "merged-image.png";
                                link.click();
                            });
                        };
                    }
                };
            }
        }
    };

    const handleClearImage = () => {
        setImage(null);
        canvasRef.current?.clear();
    };

    return (
        <div className="flex flex-col items-center">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && (
                <div className="relative">
                    <img
                        ref={imageRef}
                        src={image}
                        alt="Selected"
                        className="absolute top-0 left-0 w-full h-full"
                    />
                    <CanvasDraw
                        ref={canvasRef}
                        canvasWidth={500}
                        canvasHeight={500}
                        className="border"
                    />
                </div>
            )}
            <button onClick={handleSave} className="mt-4 p-2 bg-blue-500 text-white">
                Save Changes
            </button>
            <button onClick={() => canvasRef.current?.clear()} className="mt-4 p-2 bg-red-500 text-white">
                Clear Drawing
            </button>
            <button onClick={handleClearImage} className="mt-4 p-2 bg-yellow-500 text-white">
                Clear Image
            </button>
        </div>
    );
};

export default DrawCanva;