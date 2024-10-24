import { ScoreOnStudent, StudentOnSubject } from "@/interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateStudentOnSubjectService = {
  studentId: string;
  subjectId: string;
};

type ResponseCreateStudentOnSubjectService = StudentOnSubject;

export async function CreateStudentOnSubjectService(
  input: RequestCreateStudentOnSubjectService
): Promise<ResponseCreateStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/student-on-subjects`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create StudentOnSubject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestSortStudentOnSubjectService = {
  studentOnSubjectIds: string[];
};

type ResponseSortStudentOnSubjectService = StudentOnSubject;

export async function SortStudentOnSubjectService(
  input: RequestSortStudentOnSubjectService
): Promise<ResponseSortStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/student-on-subjects/sort`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create StudentOnSubject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectBySubjectService = {
  subjectId: string;
};

type ResponseGetStudentOnSubjectBySubjectService = StudentOnSubject[];

export async function GetStudentOnSubjectBySubjectService(
  input: RequestGetStudentOnSubjectBySubjectService
): Promise<ResponseGetStudentOnSubjectBySubjectService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get StudentOnSubject by Subject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectByStudentService = {
  studentId: string;
};

type ResponseGetStudentOnSubjectByStudentService = StudentOnSubject[];

export async function GetStudentOnSubjectByStudentService(
  input: RequestGetStudentOnSubjectByStudentService
): Promise<ResponseGetStudentOnSubjectByStudentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/student/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get StudentOnSubject by Student request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectByIdService = {
  studentOnSubjectId: string;
};

type ResponseGetStudentOnSubjectByIdService = StudentOnSubject;

export async function GetStudentOnSubjectByIdService(
  input: RequestGetStudentOnSubjectByIdService
): Promise<ResponseGetStudentOnSubjectByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get StudentOnSubject by ID request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestDeleteStudentOnSubjectService = {
  studentOnSubjectId: string;
};

type ResponseDeleteStudentOnSubjectService = {
  message: string;
};

export async function DeleteStudentOnSubjectService(
  input: RequestDeleteStudentOnSubjectService
): Promise<ResponseDeleteStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete StudentOnSubject request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
