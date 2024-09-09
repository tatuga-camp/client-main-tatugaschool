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

type ResponseCreateFileAssignmentService = {
  id: string;
  createAt: string;
  updateAt: string;
  type: string;
  url: string;
  size: number;
  subjectId: string;
  schoolId: string;
  assignmentId: string;
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
    console.error(
      "Create File Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export async function GetFileAssignmentService(
  assignmentId: string
): Promise<ResponseCreateFileAssignmentService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/file-assignments/assignment/${assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get File Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function DeleteFileAssignmentService(
  fileOnAssignmentId: string
): Promise<{ message: string }> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/file-assignments/${fileOnAssignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete File Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
