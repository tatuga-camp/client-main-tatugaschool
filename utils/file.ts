export async function urlToFile(
  url: string,
  fileName: string = "image.jpg",
  mimeType: string = "image/jpeg",
) {
  try {
    // Fetch the image from the URL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": mimeType,
      },
    });

    // Convert the response to a Blob
    const blob = await response.blob();

    // Create a File object from the Blob
    const file = new File([blob], fileName, { type: mimeType });

    return file;
  } catch (error) {
    console.error("Error converting URL to File:", error);
    return null;
  }
}

export async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result); // this is a base64 data URL
      } else {
        reject("Failed to convert to base64");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export const file2Base64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = (error) => reject(error);
  });
};

import "pdfjs-dist/build/pdf.worker.mjs";

/**
 * Generates a thumbnail (data URL) from the first page of a PDF.
 * @param pdfUrl The URL of the PDF file.
 * @param desiredWidth The desired width for the thumbnail image.
 * @returns A Promise that resolves to a data URL (string) of the generated thumbnail.
 * @throws {Error} If PDF loading or rendering fails.
 */

export async function generatePdfThumbnail(
  pdfUrl: string,
  desiredWidth: number = 400,
): Promise<string | void> {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const { getDocument } = await import("pdfjs-dist");

    const imagesList = [];

    const _PDF_DOC = await getDocument({ url: pdfUrl }).promise;
    const canvas = document.createElement("canvas");

    var page = await _PDF_DOC.getPage(1);
    var viewport = page.getViewport({ scale: 1 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const render_context = {
      canvasContext: canvas.getContext("2d") as CanvasRenderingContext2D,
      viewport: viewport,
    };

    await page.render(render_context).promise;
    let img = canvas.toDataURL("image/png");
    imagesList.push(img);

    return imagesList[0];
  } catch (error) {
    console.error("Error in generatePdfThumbnail:", error);
    throw error; // Re-throw the error so the calling component can handle it
  }
}
