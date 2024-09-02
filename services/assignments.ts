import axios from "axios";
import { parseCookies } from "nookies";

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

type ResponseCreateAssignmentService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: string;
  schoolId: string;
  userId: string;
};

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

type ResponseGetAssignmentsService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: string;
  dueDate: string | null;
  isAllowDeleteWork: boolean;
  vector: any[];
  subjectId: string;
  schoolId: string;
  userId: string;
};

export async function GetAssignmentsBySubjectIdService(
  subjectId: string
): Promise<ResponseGetAssignmentsService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/assignments/subject/${subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignments request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type ResponseGetAssignmentByIdService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: string;
  dueDate: string | null;
  isAllowDeleteWork: boolean;
  vector: any[];
  subjectId: string;
  schoolId: string;
  userId: string;
};

export async function GetAssignmentByIdService(
  assignmentId: string
): Promise<ResponseGetAssignmentByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/assignments/${assignmentId}`,
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

type ResponseUpdateAssignmentService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: string;
  dueDate?: string;
  isAllowDeleteWork: boolean;
  vector: any[];
  subjectId: string;
  schoolId: string;
  userId: string;
};

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

type ResponseDeleteAssignmentService = {
  message: string;
};

export async function DeleteAssignmentService(
  assignmentId: string
): Promise<ResponseDeleteAssignmentService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/assignments/${assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}
