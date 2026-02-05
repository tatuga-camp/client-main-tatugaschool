import { FileOnAssignment } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateFileAssignmentService = {
  type: string;
  url: string;
  size: number;
  assignmentId: string;
  blurHash?: string;
};

type ResponseCreateFileAssignmentService = FileOnAssignment;

type RequestGetFileAssignmentService = {
  assignmentId: string;
};

type ResponseGetFileAssignmentService = ResponseCreateFileAssignmentService[];

export type RequestDeleteFileAssignmentService = {
  fileOnAssignmentId: string;
};

type ResponseDeleteFileAssignmentService = FileOnAssignment;

export async function CreateFileAssignmentService(
  input: RequestCreateFileAssignmentService,
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

export type RequestUpdateFileAssignmentService = {
  id: string;
  preventFastForward?: boolean;
};

type ResponseUpdateFileAssignmentService = FileOnAssignment;

export async function UpdateFileAssignmentService(
  input: RequestUpdateFileAssignmentService,
): Promise<ResponseUpdateFileAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "/v1/file-assignments",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetFileAssignmentService(
  input: RequestGetFileAssignmentService,
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
  input: RequestDeleteFileAssignmentService,
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
