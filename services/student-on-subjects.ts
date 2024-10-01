import { StudentOnSubject } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateStudentOnSubjectService = {
  studentId: string;
  subjectId: string;
};

type ResponseCreateStudentOnSubjectService = StudentOnSubject;

export async function CreateStudentOnSubjectService(
  input: RequestCreateStudentOnSubjectService
): Promise<ResponseCreateStudentOnSubjectService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/student-on-subjects`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create StudentOnSubject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectBySubjectService = {
  subjectId: string;
};

type ResponseGetStudentOnSubjectBySubjectService = StudentOnSubject[];

export async function GetStudentOnSubjectBySubjectService(
  input: RequestGetStudentOnSubjectBySubjectService
): Promise<ResponseGetStudentOnSubjectBySubjectService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/student-on-subjects/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get StudentOnSubject by Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectByStudentService = {
  studentId: string;
};

type ResponseGetStudentOnSubjectByStudentService = StudentOnSubject[];

export async function GetStudentOnSubjectByStudentService(
  input: RequestGetStudentOnSubjectByStudentService
): Promise<ResponseGetStudentOnSubjectByStudentService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/student-on-subjects/student/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get StudentOnSubject by Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectByIdService = {
  studentOnSubjectId: string;
};

type ResponseGetStudentOnSubjectByIdService = StudentOnSubject;

export async function GetStudentOnSubjectByIdService(
  input: RequestGetStudentOnSubjectByIdService
): Promise<ResponseGetStudentOnSubjectByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get StudentOnSubject by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteStudentOnSubjectService = {
  studentOnSubjectId: string;
};

type ResponseDeleteStudentOnSubjectService = {
  message: string;
};

export async function DeleteStudentOnSubjectService(
  input: RequestDeleteStudentOnSubjectService
): Promise<ResponseDeleteStudentOnSubjectService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete StudentOnSubject request failed:", error.response.data);
    throw error?.response?.data;
  }
}