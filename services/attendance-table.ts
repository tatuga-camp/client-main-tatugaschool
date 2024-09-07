import axios from "axios";
import { parseCookies } from "nookies";
import { AttendanceTable } from "@/interfaces/AttendanceTable";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestGetAttendanceTablesService = {
  subjectId: string;
};

type ResponseGetAttendanceTablesService = AttendanceTable[];

export async function GetAttendanceTablesService(
  input: RequestGetAttendanceTablesService
): Promise<ResponseGetAttendanceTablesService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/attendance-tables`,
      params: { subjectId: input.subjectId },
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch Attendance Tables:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestGetAttendanceTableByIdService = {
  attendanceTableId: string;
};

type ResponseGetAttendanceTableByIdService = AttendanceTable;

export async function GetAttendanceTableByIdService(
  input: RequestGetAttendanceTableByIdService
): Promise<ResponseGetAttendanceTableByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/attendance-tables/${input.attendanceTableId}`,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch Attendance Table:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestCreateAttendanceTableService = {
  title: string;
  description?: string;
  subjectId: string;
  teamId: string;
  schoolId: string;
};

type ResponseCreateAttendanceTableService = AttendanceTable;

export async function CreateAttendanceTableService(
  input: RequestCreateAttendanceTableService
): Promise<ResponseCreateAttendanceTableService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/attendance-tables/",
      data: input,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to create Attendance Table:", error.response?.data);
    throw error?.response?.data;
  }
}
type RequestUpdateAttendanceTableService = {
  query: {
    attendanceTableId: string;
  };
  body: {
    title?: string;
    description?: string;
  };
};

type ResponseUpdateAttendanceTableService = AttendanceTable;

export async function UpdateAttendanceTableService(
  input: RequestUpdateAttendanceTableService
): Promise<ResponseUpdateAttendanceTableService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/attendance-tables/${input.query.attendanceTableId}`,
      data: {
        ...input.body,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Attendance Table request failed:",
      error.response?.data
    );
    throw error?.response?.data;
  }
}
type RequestDeleteAttendanceTableService = {
  attendanceTableId: string;
};

type ResponseDeleteAttendanceTableService = {
  message: string;
};

export async function DeleteAttendanceService(
  input: RequestDeleteAttendanceTableService
): Promise<ResponseDeleteAttendanceTableService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/attendance-tables/${input.attendanceTableId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Attendance Table request failed:",
      error.response?.data
    );
    throw error?.response?.data;
  }
}
