const MAX_OUTPUT_SIZE = 512;
const JPEG_QUALITY = 0.9;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });
};

// Bounding box of an image after rotating it around its center
const getRotatedSize = (
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } => {
  const radian = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(radian) * width) + Math.abs(Math.sin(radian) * height),
    height:
      Math.abs(Math.sin(radian) * width) + Math.abs(Math.cos(radian) * height),
  };
};

/**
 * Bakes the crop area and rotation selected in react-easy-crop into real
 * pixels and returns a JPEG file capped at MAX_OUTPUT_SIZE. Because the
 * output comes from a canvas it carries no EXIF orientation, so it renders
 * the same everywhere.
 */
export const createCroppedPhotoFile = async ({
  imageSrc,
  pixelCrop,
  rotation = 0,
  fileName = "student-photo.jpg",
}: {
  imageSrc: string;
  pixelCrop: { x: number; y: number; width: number; height: number };
  rotation?: number;
  fileName?: string;
}): Promise<File> => {
  const image = await loadImage(imageSrc);

  // react-easy-crop reports pixelCrop relative to the rotated image's
  // bounding box, so draw the rotated image into a canvas of that size first
  const bBox = getRotatedSize(image.width, image.height, rotation);
  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = bBox.width;
  rotatedCanvas.height = bBox.height;
  const rotatedCtx = rotatedCanvas.getContext("2d");
  if (!rotatedCtx) {
    throw new Error("Failed to get 2D context from canvas.");
  }
  rotatedCtx.translate(bBox.width / 2, bBox.height / 2);
  rotatedCtx.rotate((rotation * Math.PI) / 180);
  rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const scale = Math.min(
    1,
    MAX_OUTPUT_SIZE / Math.max(pixelCrop.width, pixelCrop.height),
  );
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = Math.round(pixelCrop.width * scale);
  outputCanvas.height = Math.round(pixelCrop.height * scale);
  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) {
    throw new Error("Failed to get 2D context from canvas.");
  }
  outputCtx.fillStyle = "#ffffff";
  outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputCtx.drawImage(
    rotatedCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to export cropped image."));
        }
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  return new File([blob], fileName.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
};
