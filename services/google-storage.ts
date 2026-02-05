import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

type RequestGetSignedURL = {
  fileName: string;
  fileType: string;
  fileSize: number;
  schoolId?: string;
};

type ResponseGetSignedURL = {
  signURL: string;
  originalURL: string;
  contentType: string;
  fileName: string;
};

export async function getSignedURLTeacherService(
  input: RequestGetSignedURL,
): Promise<ResponseGetSignedURL> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/google-storage/get-signURL/teacher",
      params: { ...input },
    });

    return response.data;
  } catch (error: any) {
    console.error("Get Signed URL request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUploadSignURLService = {
  contentType: string;
  file: File;
  signURL: string;
};
export async function UploadSignURLService(
  input: RequestUploadSignURLService,
): Promise<{
  message: "success" | "error";
}> {
  try {
    await fetch(input.signURL, {
      method: "PUT",
      headers: {
        "Content-Type": `${input.contentType}`,
      },
      body: input.file,
    });
    return { message: "success" };
  } catch (error: any) {
    console.error("Upload file fail:", error.response.data);
    throw error?.response?.data;
  }
}

export async function UploadSignURLWithProgressService(
  input: RequestUploadSignURLService & {
    onProgress?: (progress: number, event: ProgressEvent) => void;
  },
): Promise<{
  message: "success" | "error";
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", input.signURL, true);
    xhr.setRequestHeader("Content-Type", input.contentType);

    if (input.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          input.onProgress!(percentComplete, event);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve({ message: "success" });
      } else {
        console.error("Upload file fail:", xhr.responseText);
        reject(xhr.responseText);
      }
    };

    xhr.onerror = () => {
      console.error("Upload file fail: Network Error");
      reject(new Error("Network Error"));
    };

    xhr.send(input.file);
  });
}
