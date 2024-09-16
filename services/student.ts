import { Student } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateStudentService = {
  number: string;
  classId: string;
};

type ResponseCreateStudentService = Student;

export async function CreateStudentService(
  input: RequestCreateStudentService
): Promise<ResponseCreateStudentService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/students`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentByIdService = {
  studentId: string;
};

type ResponseGetStudentByIdService = Student;

export async function GetStudentByIdService(
  input: RequestGetStudentByIdService
): Promise<ResponseGetStudentByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/students/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Student by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetStudentsByClassIdService = {
  classId: string;
};

type ResponseGetStudentsByClassIdService = Student[];

export async function GetStudentsByClassIdService(
  input: RequestGetStudentsByClassIdService
): Promise<ResponseGetStudentsByClassIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/class/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Students by ClassId request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestUpdateStudentService = {
  query: { studentId: string };
  body: {
    title: string;
    firstName: string;
    lastName: string;
    picture: string;
    number: string;
    password?: string;
  };
};

type ResponseUpdateStudentService = Student;

export async function UpdateStudentService(
  input: RequestUpdateStudentService
): Promise<ResponseUpdateStudentService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/students/${input.query.studentId}`,
      data: { ...input.body },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteStudentService = {
  studentId: string;
};

type ResponseDeleteStudentService = {
  message: string;
};

export async function DeleteStudentService(
  input: RequestDeleteStudentService
): Promise<ResponseDeleteStudentService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/students/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}
