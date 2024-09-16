import { StudentOnAssignment } from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateStudentOnAssignmentService = {
  studentOnSubjectId: string;
  assignmentId: string;
};

type ResponseCreateStudentOnAssignmentService = StudentOnAssignment;

export async function CreateStudentOnAssignmentService(
  input: RequestCreateStudentOnAssignmentService
): Promise<ResponseCreateStudentOnAssignmentService> {
  try {
    const response = await axios({
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
  page?: number;
  limit?: number;
};

type ResponseGetStudentOnAssignmentsService = Pagination<StudentOnAssignment>;

export async function GetStudentOnAssignmentsByAssignmentIdService(
  input: RequestGetStudentOnAssignmentsService
): Promise<ResponseGetStudentOnAssignmentsService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/student-on-assignments/assignment/${input.assignmentId}`,
      params: { ...input },
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
    const response = await axios({
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

type RequestUpdateStudentOnAssignmentService = {
  query: { studentOnAssignmentId: string };
  body: {
    score?: number;
    body?: string;
    isCompleted?: boolean;
    isReviewed?: boolean;
  };
};

type ResponseUpdateStudentOnAssignmentService = StudentOnAssignment;

export async function UpdateStudentOnAssignmentService(
  input: RequestUpdateStudentOnAssignmentService
): Promise<ResponseUpdateStudentOnAssignmentService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/student-on-assignments/${input.query.studentOnAssignmentId}`,
      data: { ...input.body },
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
    const response = await axios({
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
