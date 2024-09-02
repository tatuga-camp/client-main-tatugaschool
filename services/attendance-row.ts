import axios from "axios";
import { parseCookies } from "nookies";
import { Attendance, AttendanceRow } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestGetAttendanceRowService = {
  attendanceRowId: string;
};

export async function GetAttendanceRowService(
  input: RequestGetAttendanceRowService
): Promise<AttendanceRow[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/attendance-rows?attendanceRowId=${input.attendanceRowId}`,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch Attendance Row:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetAttendanceRowByIdService = {
  attendanceRowId: string;
};

export type ResponseGetAttendanceRowByIdService = AttendanceRow & {
  attendances: Attendance[];
};

export async function GetAttendanceRowByIdService(
  input: RequestGetAttendanceRowByIdService
): Promise<ResponseGetAttendanceRowByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/attendance-rows/${input.attendanceRowId}`,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch Attendance Row:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestCreateAttendanceRowService = {
  startDate: string;
  endDate: string;
  note?: string;
  attendanceTableId: string;
  subjectId: string;
  teamId: string;
  schoolId: string;
};

export type ResponseCreateAttendanceRowService = AttendanceRow & {
  attendances: Attendance[];
};

export async function CreateAttendanceRowService(
  input: RequestCreateAttendanceRowService
): Promise<ResponseCreateAttendanceRowService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/attendance-rows/",
      data: { ...input },
    });

    return response.data;
  } catch (error: any) {
    console.error("Attendance Row creation failed:", error.response?.data);
    throw error?.response?.data;
  }
}

type UpdateAttendanceRowQuery = {
  attendanceRowId: string;
};

type UpdateAttendanceRowBody = {
  startDate?: string;
  endDate?: string;
  note?: string;
};

type RequestUpdateAttendanceRowService = {
  query: UpdateAttendanceRowQuery;
  body: UpdateAttendanceRowBody;
};

export async function UpdateAttendanceRowService(
  input: RequestUpdateAttendanceRowService
): Promise<AttendanceRow> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/attendance-rows/${input.query.attendanceRowId}`,
      data: input.body,
    });

    return response.data;
  } catch (error: any) {
    console.error("Attendance Row update failed:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestDeleteAttendanceRowService = {
  attendanceRowId: string;
};

export async function DeleteAttendanceRowService(
  input: RequestDeleteAttendanceRowService
) {
  try {
    await axios({
      method: "DELETE",
      url: `/v1/attendance-rows/${input.attendanceRowId}`,
    });
  } catch (error: any) {
    console.error("Failed to delete Attendance Row:", error.response?.data);
    throw error?.response?.data;
  }
}
