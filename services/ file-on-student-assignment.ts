import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateFileOnStudentAssignmentsService = {
  type: string;
  url: string;
  size: number;
  studentOnAssignmentId: string;
};

type ResponseCreateFileOnStudentAssignmentsService = {
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

export async function CreateFileOnStudentAssignmentsService(
  input: RequestCreateFileOnStudentAssignmentsService
): Promise<ResponseCreateFileOnStudentAssignmentsService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/file-on-student-assignments`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create File request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function GetFileOnStudentAssignmentsByStudentOnAssignmentIdService(
  studentOnAssignmentId: string
): Promise<ResponseCreateFileOnStudentAssignmentsService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/file-on-student-assignments/student-on-assignment/${studentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get File request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function GetFileOnStudentAssignmentsByTeacherOnAssignmentIdService(
  studentOnAssignmentId: string
): Promise<ResponseCreateFileOnStudentAssignmentsService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/file-on-student-assignments/student-on-assignment/${studentOnAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get File request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function DeleteFileOnStudentAssignmentsService(
  fileOnStudentAssignmentId: string
): Promise<void> {
  try {
    await axios({
      method: "DELETE",
      url: `/v1/file-on-student-assignments/${fileOnStudentAssignmentId}/student`,
    });
  } catch (error: any) {
    console.error("Delete File request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function DeleteFileOnTeacherAssignmentsService(
  fileOnStudentAssignmentId: string
): Promise<void> {
  try {
    await axios({
      method: "DELETE",
      url: `/v1/file-on-student-assignments/${fileOnStudentAssignmentId}/teacher`,
    });
  } catch (error: any) {
    console.error("Delete File request failed:", error.response.data);
    throw error?.response?.data;
  }
}
