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

type RequestGetFileOnStudentAssignmentsByStudentOnAssignmentIdService = {
  studentOnAssignmentId: string;
};

type ResponseGetFileOnStudentAssignmentsService = ResponseCreateFileOnStudentAssignmentsService[];

type RequestDeleteFileOnStudentAssignmentsService = {
  fileOnStudentAssignmentId: string;
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
    throw error?.response?.data;
  }
}

export async function GetFileOnStudentAssignmentsByStudentOnAssignmentIdService(
  input: RequestGetFileOnStudentAssignmentsByStudentOnAssignmentIdService
): Promise<ResponseGetFileOnStudentAssignmentsService> {
  try {
    const response = await axios({
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
    const response = await axios({
      method: "GET",
      url: `/v1/file-on-student-assignments/student-on-assignment/${input.studentOnAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function DeleteFileOnStudentAssignmentsService(
  input: RequestDeleteFileOnStudentAssignmentsService
): Promise<void> {
  try {
    await axios({
      method: "DELETE",
      url: `/v1/file-on-student-assignments/${input.fileOnStudentAssignmentId}/student`,
    });
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function DeleteFileOnTeacherAssignmentsService(
  input: RequestDeleteFileOnStudentAssignmentsService
): Promise<void> {
  try {
    await axios({
      method: "DELETE",
      url: `/v1/file-on-student-assignments/${input.fileOnStudentAssignmentId}/teacher`,
    });
  } catch (error: any) {
    throw error?.response?.data;
  }
}