import axios from "axios";
import { parseCookies } from "nookies";
import { Assignment } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateAssignmentService = {
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: string;
  subjectId: string;
};

type ResponseCreateAssignmentService = Assignment;

export async function CreateAssignmentService(
  input: RequestCreateAssignmentService
): Promise<ResponseCreateAssignmentService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/assignments`,
      data: { ...input },
    });

    return response.data;
  } catch (error: any) {
    console.error("Create Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type ResponseGetAssignmentsService = Assignment[];

export async function GetAssignmentsBySubjectIdService(input: {
  subjectId: string;
}): Promise<ResponseGetAssignmentsService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/assignments/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignments request failed:", error.response.data);
    throw error?.response?.data;
  }
}
type RequestGetAssignmentByIdService = {
  assignmentId: string;
};

type ResponseGetAssignmentByIdService = Assignment;

export async function GetAssignmentByIdService(
  input: RequestGetAssignmentByIdService
): Promise<ResponseGetAssignmentByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/assignments/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignment by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateAssignmentService = {
  query: {
    assignmentId: string;
  };
  data: {
    title: string;
    description: string;
    maxScore: number;
    weight: number;
    beginDate: string;
    isAllowDeleteWork: boolean;
    dueDate?: string;
  };
};

type ResponseUpdateAssignmentService = Assignment;

export async function UpdateAssignmentService(
  input: RequestUpdateAssignmentService
): Promise<ResponseUpdateAssignmentService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/assignments`,
      data: {
        query: {
          assignmentId: input.query.assignmentId,
        },
        data: input.data,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}
type RequestDeleteAssignmentService = {
  assignmentId: string;
};

type ResponseDeleteAssignmentService = {
  message: string;
};

export async function DeleteAssignmentService(
  input: RequestDeleteAssignmentService
): Promise<ResponseDeleteAssignmentService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/assignments/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}
