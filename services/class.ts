import { Class } from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateClassService = Class;

type ResponseCreateClassService = Class;

export async function CreateClassService(
  input: RequestCreateClassService
): Promise<ResponseCreateClassService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/classes`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Class request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetClassService = {
  schoolId: string;
};

type ResponseGetClassService = Pagination<Class>;

export async function GetClassesBySchoolIdService(
  input: RequestGetClassService
): Promise<ResponseGetClassService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/classes`,
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Classes request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetClassByIdService = {
  classId: string;
};

type ResponseGetClassByIdService = Class;

export async function GetClassByIdService(
  input: RequestGetClassByIdService
): Promise<ResponseGetClassByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/classes/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Class by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateClassService = {
  classId: string;
  schoolId: string;
  title: string;
  level: string;
  description: string;
  educationYear: string;
};

type ResponseUpdateClassService = Class;

export async function UpdateClassService(
  input: RequestUpdateClassService
): Promise<ResponseUpdateClassService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/classes/${input.classId}`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Class request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteClassService = {
  classId: string;
};

type ResponseDeleteClassService = {
  message: string;
};

export async function DeleteClassService(
  input: RequestDeleteClassService
): Promise<ResponseDeleteClassService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/classes/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Class request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestReorderClassesService = {
  classIds: string[];
};

type ResponseReorderClassesService = Class;

export async function ReorderClassesService(
  input: RequestReorderClassesService
): Promise<ResponseReorderClassesService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/classes/reorder`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Classes request failed:", error.response.data);
    throw error?.response?.data;
  }
}
