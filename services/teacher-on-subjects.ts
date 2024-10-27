import { TeacherOnSubject } from "@/interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type RequestCreateTeacherOnSubjectService = {
  role: string;
  email: string;
  subjectId: string;
};

type ResponseCreateTeacherOnSubjectService = TeacherOnSubject;

export async function CreateTeacherOnSubjectService(
  input: RequestCreateTeacherOnSubjectService
): Promise<ResponseCreateTeacherOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/teacher-on-subjects`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create Teacher on Subject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetTeacherOnSubjectBySubjectService = {
  subjectId: string;
};

type ResponseGetTeacherOnSubjectBySubjectService = TeacherOnSubject[];

export async function GetTeacherOnSubjectBySubjectService(
  input: RequestGetTeacherOnSubjectBySubjectService
): Promise<ResponseGetTeacherOnSubjectBySubjectService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/teacher-on-subjects/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Teacher on Subject by Subject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetTeacherOnSubjectByIdService = {
  teacherOnSubjectId: string;
};

type ResponseGetTeacherOnSubjectByIdService = TeacherOnSubject;

export async function GetTeacherOnSubjectByIdService(
  input: RequestGetTeacherOnSubjectByIdService
): Promise<ResponseGetTeacherOnSubjectByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/teacher-on-subjects/${input.teacherOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Teacher on Subject by ID request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export type RequestUpdateTeacherOnSubjectService = {
  query: { teacherOnSubjectId: string };
  body: {
    status?: string;
    role?: string;
  };
};

type ResponseUpdateTeacherOnSubjectService = TeacherOnSubject;

export async function UpdateTeacherOnSubjectService(
  input: RequestUpdateTeacherOnSubjectService
): Promise<ResponseUpdateTeacherOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/teacher-on-subjects`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Teacher on Subject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestDeleteTeacherOnSubjectService = {
  teacherOnSubjectId: string;
};

type ResponseDeleteTeacherOnSubjectService = {
  message: string;
};

export async function DeleteTeacherOnSubjectService(
  input: RequestDeleteTeacherOnSubjectService
): Promise<ResponseDeleteTeacherOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/teacher-on-subjects/${input.teacherOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Teacher on Subject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
