import { encode } from "blurhash";

type ImageFile = File;

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
import { defaultBlurHash, defaultCanvas } from "../data";

// Components call this inline in render (e.g. `blurDataURL={...}`), so the
// same hash is decoded again on every re-render. During a dnd-kit drag every
// sortable row re-renders per pointer move, which made each frame decode and
// PNG-encode dozens of canvases. The output is a pure function of the inputs,
// so cache it.
const BLURHASH_CACHE_LIMIT = 500;
const blurhashCache = new Map<string, string>();

// Decode the blurhash into pixels
export const decodeBlurhashToCanvas = (
  blurhash: string = defaultBlurHash,
  width: number = 32,
  height: number = 32
): string => {
  // Decode the blurhash
  if (typeof window !== "undefined") {
    // client-side-only code
    const cacheKey = `${blurhash}|${width}|${height}`;
    const cached = blurhashCache.get(cacheKey);
    if (cached !== undefined) return cached;

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
    const dataUrl = canvas.toDataURL();
    if (blurhashCache.size >= BLURHASH_CACHE_LIMIT) {
      // Drop the oldest entry (Map keeps insertion order).
      blurhashCache.delete(blurhashCache.keys().next().value as string);
    }
    blurhashCache.set(cacheKey, dataUrl);
    return dataUrl;
  } else {
    return defaultCanvas;
  }
};
