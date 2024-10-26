import { encode } from "blurhash";

type ImageFile = File;

interface ImageData {
  file: ImageFile;
  url: string;
  blurHash: string | null;
}

// Function to load the image from a file
const loadImageFromFile = (file: ImageFile): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Function to get pixel data from the image
const getImagePixels = (
  img: HTMLImageElement,
  width: number,
  height: number
): Uint8ClampedArray => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas.");
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  return imageData.data; // Uint8ClampedArray
};

// Function to generate the blur hash
export const generateBlurHash = async (
  file: ImageFile,
  width: number = 32,
  height: number = 32,
  componentX: number = 4,
  componentY: number = 4
): Promise<string> => {
  try {
    // Load the image from the file
    const img = await loadImageFromFile(file);

    // Get pixel data from the image
    const pixels = getImagePixels(img, width, height);

    // Encode the pixels into a blur hash
    const blurHash = encode(pixels, width, height, componentX, componentY);

    return blurHash;
  } catch (error) {
    console.error("Error generating blur hash:", error);
    throw error;
  }
};

import { decode } from "blurhash";
import { defaultCanvas } from "../data";

// Decode the blurhash into pixels
export const decodeBlurhashToCanvas = (
  blurhash: string,
  width: number = 32,
  height: number = 32
): string => {
  // Decode the blurhash
  if (typeof window !== "undefined") {
    // client-side-only code

    const pixels = decode(blurhash, width, height);

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas.");
    }

    // Set the canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Create ImageData from the decoded pixels
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels); // Set the pixels data in the canvas

    // Put the image data into the canvas
    ctx.putImageData(imageData, 0, 0);

    // Convert the canvas to a data URL (Base64 PNG)
    return canvas.toDataURL();
  } else {
    return defaultCanvas;
  }
};
