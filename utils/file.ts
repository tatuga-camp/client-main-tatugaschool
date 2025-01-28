export async function urlToFile(
  url: string,
  fileName: string = "image.jpg",
  mimeType: string = "image/jpeg"
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
