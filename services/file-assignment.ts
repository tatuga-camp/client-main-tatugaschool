import { FileOnAssignment } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

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
    const response = await axios({
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
    const response = await axios({
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
    const response = await axios({
      method: "DELETE",
      url: `/v1/file-assignments/${input.fileOnAssignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}