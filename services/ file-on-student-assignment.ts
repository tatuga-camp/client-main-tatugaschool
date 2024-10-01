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


type RequestDeleteFileOnStudentAssignmentsService = {
  fileOnStudentAssignmentId: string;
};

type ResponseDeleteFileOnStudentAssignmentsService = {
  message: string;
};


export async function DeleteFileOnStudentAssignmentsService(
  input: RequestDeleteFileOnStudentAssignmentsService
): Promise<ResponseDeleteFileOnStudentAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/file-on-student-assignments/${input.fileOnStudentAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}


type RequestDeleteFileOnTeacherAssignmentsService = {
  fileOnStudentAssignmentId: string;
};

type ResponseDeleteFileOnTeacherAssignmentsService = {
  message: string;
};
export async function DeleteFileOnTeacherAssignmentsService(
  input: RequestDeleteFileOnTeacherAssignmentsService
): Promise<ResponseDeleteFileOnTeacherAssignmentsService> {
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