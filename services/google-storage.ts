import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type ResponseGoogleStorageSignedURL = {
  signURL: string;
  originalURL: string;
  contentType: string;
  fileName: string;
};

export async function GetGoogleStorageSignedURL(
  fileName: string,
  fileType: string
): Promise<ResponseGoogleStorageSignedURL> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/google-storage/get-signURL/teacher`,
      params: {
        fileName: fileName,
        fileType: fileType,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Signed URL request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateFileAssignmentService = {
  type: string;
  url: string;
  size: number;
  assignmentId: string;
  studentOnAssignmentId: string;
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
  studentId: string;
  studentOnAssignmentId: string;
};

export async function CreateFileAssignmentService(
  input: RequestCreateFileAssignmentService
): Promise<ResponseCreateFileAssignmentService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/file-assignments`,
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
