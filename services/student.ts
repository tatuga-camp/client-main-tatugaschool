import { Student } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateStudentService = {
  title: string;
  firstName: string;
  lastName: string;
  blurHash?: string | undefined;
  photo?: string | undefined;
  number: string;
  classId: string;
};

type ResponseCreateStudentService = Student;

export async function CreateStudentService(
  input: RequestCreateStudentService,
): Promise<ResponseCreateStudentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/students`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentByIdService = {
  studentId: string;
};

type ResponseGetStudentByIdService = Student;

export async function GetStudentByIdService(
  input: RequestGetStudentByIdService,
): Promise<ResponseGetStudentByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/students/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Student by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentsByClassIdService = {
  classId: string;
};

type ResponseGetStudentsByClassIdService = Student[];

export async function GetStudentsByClassIdService(
  input: RequestGetStudentsByClassIdService,
): Promise<ResponseGetStudentsByClassIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/class/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Students by ClassId request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

export type RequestUpdateStudentService = {
  query: { studentId: string };
  body: {
    title?: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
    number?: string;
    password?: string;
    blurHash?: string;
  };
};

type ResponseUpdateStudentService = Student;

export async function UpdateStudentService(
  input: RequestUpdateStudentService,
): Promise<ResponseUpdateStudentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/students`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteStudentService = {
  studentId: string;
};

type ResponseDeleteStudentService = Student;

export async function DeleteStudentService(
  input: RequestDeleteStudentService,
): Promise<ResponseDeleteStudentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/students/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestResetPasswordStudentService = {
  studentId: string;
};

type ResponseResetPasswordStudentService = Student;

export async function ResetPasswordStudentService(
  input: RequestResetPasswordStudentService,
): Promise<ResponseResetPasswordStudentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/students/${input.studentId}/reset-password`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}
