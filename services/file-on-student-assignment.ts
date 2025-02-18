import { FileOnStudentOnAssignment } from "@/interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateFileOnStudentAssignmentsService = {
  type: string;
  url: string;
  size: number;
  studentOnAssignmentId: string;
};

type ResponseCreateFileOnStudentAssignmentsService = FileOnStudentOnAssignment;

export async function CreateFileOnStudentAssignmentsService(
  input: RequestCreateFileOnStudentAssignmentsService
): Promise<ResponseCreateFileOnStudentAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/file-on-student-assignments`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetFileOnStudentAssignmentsByStudentOnAssignmentIdService = {
  studentOnAssignmentId: string;
};

type ResponseGetFileOnStudentAssignmentsService = FileOnStudentOnAssignment[];

export async function GetFileOnStudentAssignmentsByStudentOnAssignmentIdService(
  input: RequestGetFileOnStudentAssignmentsByStudentOnAssignmentIdService
): Promise<ResponseGetFileOnStudentAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/file-on-student-assignments/student-on-assignment/${input.studentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetFileOnStudentAssignmentsByTeacherOnAssignmentIdService(
  input: RequestGetFileOnStudentAssignmentsByStudentOnAssignmentIdService
): Promise<ResponseGetFileOnStudentAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/file-on-student-assignments/student-on-assignment/${input.studentOnAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestUpdateFileOnStudentAssignmentService = {
  query: {
    id: string;
  };
  body: {
    body: string;
    name?: string;
  };
};

type ResponseUpdateFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function UpdateFileOnStudentAssignmentService(
  input: RequestUpdateFileOnStudentAssignmentService
): Promise<ResponseUpdateFileOnStudentAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `v1/file-on-student-assignments/teacher`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update FileOnStudentAssignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
export type RequestDeleteFileOnStudentAssignmentService = {
  fileOnStudentAssignmentId: string;
};

type ResponseDeleteFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function DeleteFileOnStudentAssignmentService(
  input: RequestDeleteFileOnStudentAssignmentService
): Promise<ResponseDeleteFileOnStudentAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/file-on-student-assignments/${input.fileOnStudentAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
