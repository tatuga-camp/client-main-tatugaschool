import { FileOnAssignment } from "@/interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateFileAssignmentService = {
  type: string;
  url: string;
  size: number;
  subjectId: string;
  assignmentId: string;
  schoolId: string;
};

type ResponseCreateFileAssignmentService = FileOnAssignment;

type RequestGetFileAssignmentService = {
  assignmentId: string;
};

type ResponseGetFileAssignmentService = ResponseCreateFileAssignmentService[];

type RequestDeleteFileAssignmentService = {
  fileOnAssignmentId: string;
};

type ResponseDeleteFileAssignmentService = {
  message: string;
};

export async function CreateFileAssignmentService(
  input: RequestCreateFileAssignmentService
): Promise<ResponseCreateFileAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/file-assignments",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetFileAssignmentService(
  input: RequestGetFileAssignmentService
): Promise<ResponseGetFileAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/file-assignments/assignment/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function DeleteFileAssignmentService(
  input: RequestDeleteFileAssignmentService
): Promise<ResponseDeleteFileAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/file-assignments/${input.fileOnAssignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}