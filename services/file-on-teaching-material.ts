import { FileOnTeachingMaterial } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateFileOnTeachingMaterialService = {
  url: string;
  type: string;
  size: number;
  teachingMaterialId: string;
};

type ResponseCreateFileOnTeachingMaterialService = FileOnTeachingMaterial;

export async function CreateFileOnTeachingMaterialService(
  input: RequestCreateFileOnTeachingMaterialService,
): Promise<ResponseCreateFileOnTeachingMaterialService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/file-on-teaching-materials`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteFileOnTeachingMaterialService = {
  fileOnteachingMaterialId: string;
};

type ResponseDeleteFileOnTeachingMaterialService = FileOnTeachingMaterial;

export async function DeleteFileOnTeachingMaterialService(
  input: RequestDeleteFileOnTeachingMaterialService,
): Promise<ResponseDeleteFileOnTeachingMaterialService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/file-on-teaching-materials/${input.fileOnteachingMaterialId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}
