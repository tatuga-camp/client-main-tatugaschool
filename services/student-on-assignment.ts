import {
  FileOnStudentOnAssignment,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateStudentOnAssignmentService = {
  studentOnSubjectId: string;
  assignmentId: string;
};

type ResponseCreateStudentOnAssignmentService = StudentOnAssignment;

export async function CreateStudentOnAssignmentService(
  input: RequestCreateStudentOnAssignmentService
): Promise<ResponseCreateStudentOnAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/student-on-assignments`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create Student on Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnAssignmentsService = {
  assignmentId: string;
};

export type ResponseGetStudentOnAssignmentsService = (StudentOnAssignment & {
  files: FileOnStudentOnAssignment[];
})[];

export async function GetStudentOnAssignmentsByAssignmentIdService(
  input: RequestGetStudentOnAssignmentsService
): Promise<ResponseGetStudentOnAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-assignments/assignment/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Student on Assignments request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnAssignmentByStudentIdService = {
  studentId: string;
};

type ResponseGetStudentOnAssignmentByStudentIdService = StudentOnAssignment;

export async function GetStudentOnAssignmentByStudentIdService(
  input: RequestGetStudentOnAssignmentByStudentIdService
): Promise<ResponseGetStudentOnAssignmentByStudentIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-assignments/student/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Student on Assignment by StudentId request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export type RequestUpdateStudentOnAssignmentService = {
  query: { studentOnAssignmentId: string };
  body: {
    score?: number;
    body?: string;
    isAssigned?: boolean;
    status?: StudentAssignmentStatus;
  };
};

export type ResponseUpdateStudentOnAssignmentService = StudentOnAssignment;

export async function UpdateStudentOnAssignmentService(
  input: RequestUpdateStudentOnAssignmentService
): Promise<ResponseUpdateStudentOnAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/student-on-assignments`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Student on Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestDeleteStudentOnAssignmentService = {
  studentOnAssignmentId: string;
};

type ResponseDeleteStudentOnAssignmentService = {
  message: string;
};

export async function DeleteStudentOnAssignmentService(
  input: RequestDeleteStudentOnAssignmentService
): Promise<ResponseDeleteStudentOnAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/student-on-assignments/${input.studentOnAssignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Student on Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
