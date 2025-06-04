import {
  Classroom,
  EducationYear,
  Subject,
  TeacherOnSubject,
} from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateSubjectService = {
  title: string;
  educationYear: EducationYear;
  description: string;
  classId: string;
  schoolId: string;
};

type ResponseCreateSubjectService = Subject;

export async function CreateSubjectService(
  input: RequestCreateSubjectService,
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

export type RequestGetSubjectBySchoolsService = {
  schoolId: string;
  educationYear: EducationYear;
};

export type ResponseGetSubjectBySchoolsService = (Subject & {
  teachers: TeacherOnSubject[];
  class: Classroom;
})[];

export async function GetSubjectBySchoolsBySchoolIdService(
  input: RequestGetSubjectBySchoolsService,
): Promise<ResponseGetSubjectBySchoolsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/subjects/school/${input.schoolId}`,
      params: { educationYear: input.educationYear },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subjects request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestDuplicateSubjectService = {
  title: string;
  educationYear: string;
  description: string;
  classroomId: string;
  subjectId: string;
  backgroundImage?: string;
};

export type ResponseDuplicateSubjectService = Subject;

export async function DuplicateSubjectService(
  input: RequestDuplicateSubjectService,
): Promise<ResponseDuplicateSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subjects/duplicate`,
      data: input,
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
  input: RequestGetSubjectByIdService,
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
    allowStudentDeleteWork?: boolean;
    allowStudentViewOverallScore?: boolean;
    allowStudentViewGrade?: boolean;
    allowStudentViewAttendance?: boolean;
  };
};

type ResponseUpdateSubjectService = Subject;

export async function UpdateSubjectService(
  input: RequestUpdateSubjectService,
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

export type RequestDeleteSubjectService = {
  subjectId: string;
};

type ResponseDeleteSubjectService = Subject;

export async function DeleteSubjectService(
  input: RequestDeleteSubjectService,
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

export type RequestReorderSubjectsService = {
  subjectIds: string[];
};

type ResponseReorderSubjectsService = Subject[];

export async function ReorderSubjectsService(
  input: RequestReorderSubjectsService,
): Promise<ResponseReorderSubjectsService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/subjects/reorder`,
      data: { subjectIds: input.subjectIds },
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Subjects request failed:", error.response?.data);
    throw error?.response?.data;
  }
}
