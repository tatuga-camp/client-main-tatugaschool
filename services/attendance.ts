
import { Attendance } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();
type RequestGetAttendanceByIdService = {
  attendanceId: string;
};

export async function GetAttendanceByIdService(
  input: RequestGetAttendanceByIdService
): Promise<Attendance> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/attendances/${input.attendanceId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Attendances by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateAttendanceService = {
  query: {
    attendanceId: string;
  };
  body: {
    absent: boolean;
    present: boolean;
    holiday: boolean;
    sick: boolean;
    late: boolean;
    note?: string;
  };
};

type ResponseUpdateAttendanceService = Attendance;

export async function UpdateAttendanceService(
  input: RequestUpdateAttendanceService
): Promise<ResponseUpdateAttendanceService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/attendances/${input.query.attendanceId}`,
      data: input.body,
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Attendance request failed:", error.response.data);
    throw error?.response?.data;
  }
}
