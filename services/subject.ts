import { Subject } from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateSubjectService = {
  title: string;
  educationYear: string;
  description: string;
  classId: string;
  schoolId: string;
};

type ResponseCreateSubjectService = Subject;

export async function CreateSubjectService(
  input: RequestCreateSubjectService
): Promise<ResponseCreateSubjectService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/subjects`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetSubjectsService = {
  schoolId: string;
  page: number;
  limit: number;
  search?: string;
  educationYear?: string;
};

type ResponseGetSubjectsService = Pagination<Subject>;

export async function GetSubjectsBySchoolIdService(
  input: RequestGetSubjectsService
): Promise<ResponseGetSubjectsService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/subjects`,
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subjects request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetSubjectByIdService = {
  subjectId: string;
};

type ResponseGetSubjectByIdService = Subject;

export async function GetSubjectByIdService(
  input: RequestGetSubjectByIdService
): Promise<ResponseGetSubjectByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/subjects/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subject by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateSubjectService = {
  query: { subjectId: string };
  body: {
    title: string;
    educationYear: string;
    description: string;
    backgroundImage?: string;
  };
};

type ResponseUpdateSubjectService = Subject;

export async function UpdateSubjectService(
  input: RequestUpdateSubjectService
): Promise<ResponseUpdateSubjectService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/subjects/${input.query.subjectId}`,
      data: { ...input.body },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteSubjectService = {
  subjectId: string;
};

type ResponseDeleteSubjectService = {
  message: string;
};

export async function DeleteSubjectService(
  input: RequestDeleteSubjectService
): Promise<ResponseDeleteSubjectService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/subjects/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestReorderSubjectsService = {
    subjectIds: string[]
};

type ResponseReorderSubjectsService = Subject;

export async function ReorderSubjectsService(
  input: RequestReorderSubjectsService
): Promise<ResponseReorderSubjectsService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/subjects/reorder`,
      data: { ...input.subjectIds },
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Subjects request failed:", error.response.data);
    throw error?.response?.data;
  }
}