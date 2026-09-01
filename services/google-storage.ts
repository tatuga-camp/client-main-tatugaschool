import { UploadHttpError, uploadFileToSignURL } from "../utils/uploadWithRetry";
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
  file: Blob;
  signURL: string;
};
export async function UploadSignURLService(
  input: RequestUploadSignURLService,
): Promise<{
  message: "success" | "error";
}> {
  const response = await fetch(input.signURL, {
    method: "PUT",
    headers: {
      "Content-Type": `${input.contentType}`,
    },
    body: input.file,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Upload file fail:", response.status, text);
    throw new UploadHttpError(response.status, text);
  }
  return { message: "success" };
}

export async function UploadSignURLWithProgressService(
  input: RequestUploadSignURLService & {
    onProgress?: (progress: number, event: ProgressEvent) => void;
  },
): Promise<{
  message: "success" | "error";
}> {
  return uploadFileToSignURL(input);
}
