import { Subject } from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateSubjectService = {
  title: string;
  educationYear: string;
  description: string;
  classId: string;
  schoolId: string;
};

type ResponseCreateSubjectService = Subject;

export async function CreateSubjectService(
  input: RequestCreateSubjectService
): Promise<ResponseCreateSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subjects`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetSubjectsService = {
  schoolId: string;
  page: number;
  limit: number;
  search?: string;
  educationYear?: string;
};

type ResponseGetSubjectsService = Pagination<Subject>;

export async function GetSubjectsBySchoolIdService(
  input: RequestGetSubjectsService
): Promise<ResponseGetSubjectsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/subjects`,
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subjects request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetSubjectByIdService = {
  subjectId: string;
};

type ResponseGetSubjectByIdService = Subject;

export async function GetSubjectByIdService(
  input: RequestGetSubjectByIdService
): Promise<ResponseGetSubjectByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/subjects/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subject by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateSubjectService = {
  query: { subjectId: string };
  body: {
    title?: string;
    educationYear?: string;
    description?: string;
    backgroundImage?: string;
    blurHash?: string;
  };
};

type ResponseUpdateSubjectService = Subject;

export async function UpdateSubjectService(
  input: RequestUpdateSubjectService
): Promise<ResponseUpdateSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/subjects/`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteSubjectService = {
  subjectId: string;
};

type ResponseDeleteSubjectService = {
  message: string;
};

export async function DeleteSubjectService(
  input: RequestDeleteSubjectService
): Promise<ResponseDeleteSubjectService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/subjects/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestReorderSubjectsService = {
  subjectIds: string[];
};

type ResponseReorderSubjectsService = Subject;

export async function ReorderSubjectsService(
  input: RequestReorderSubjectsService
): Promise<ResponseReorderSubjectsService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/subjects/reorder`,
      data: { ...input.subjectIds },
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Subjects request failed:", error.response.data);
    throw error?.response?.data;
  }
}
