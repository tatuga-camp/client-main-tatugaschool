import { FileOnTeachingMaterial, Plan, TeachingMaterial } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestGetDescriptionSuggestionTeachingMaterialService = {
  data: {
    url: string;
    type: string;
  }[];
};

type ResponseGetDescriptionSuggestionTeachingMaterialService = {
  description: string;
};

export async function GetDescriptionSuggestionTeachingMaterialService(
  input: RequestGetDescriptionSuggestionTeachingMaterialService,
): Promise<ResponseGetDescriptionSuggestionTeachingMaterialService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/teaching-materials/ai/description`,
      data: { data: input.data },
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateThumnailTeachingMaterialService = {
  teachingMaterialId: string;
};

type ResponseUpdateThumnailTeachingMaterialService = TeachingMaterial;

export async function UpdateThumnailTeachingMaterialService(
  input: RequestUpdateThumnailTeachingMaterialService,
): Promise<ResponseUpdateThumnailTeachingMaterialService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/teaching-materials/thumnail/${input.teachingMaterialId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestCreateTeachingMaterialService = {
  title: string;
  description: string;
  tags: string[];
  accessLevel: Plan;
};

type ResponseCreateTeachingMaterialService = TeachingMaterial;

export async function CreateTeachingMaterialService(
  input: RequestCreateTeachingMaterialService,
): Promise<ResponseCreateTeachingMaterialService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/teaching-materials`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateTeachingMaterialService = {
  query: {
    id: string;
  };
  body: {
    title?: string;
    description?: string;
    tags?: string[];
    accessLevel?: Plan;
  };
};

type ResponseUpdateTeachingMaterialService = TeachingMaterial;

export async function UpdateTeachingMaterialService(
  input: RequestUpdateTeachingMaterialService,
): Promise<ResponseUpdateTeachingMaterialService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/teaching-materials`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestGetTeachingMaterialByAiService = {
  search?: string;
};

type ResponseGetTeachingMaterialByAiService = (TeachingMaterial & {
  files: FileOnTeachingMaterial[];
})[];

export async function GetTeachingMaterialByAiService(
  input: RequestGetTeachingMaterialByAiService,
): Promise<ResponseGetTeachingMaterialByAiService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/teaching-materials`,
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("request failed:", error.response.data);
    throw error?.response?.data;
  }
}
