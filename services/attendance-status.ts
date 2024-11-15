import { AttendanceStatusList } from "../interfaces";
import createAxiosInstance from "./apiService";
const axiosInstance = createAxiosInstance();

export type RequestCreateAttendanceStatusListService = {
  title: string;
  value: number;
  color: string;
  attendanceTableId: string;
};

type ResponseCreateAttendanceStatusListService = AttendanceStatusList;

export async function CreateAttendanceStatusListService(
  input: RequestCreateAttendanceStatusListService
): Promise<ResponseCreateAttendanceStatusListService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/attendance-status-lists`,
      data: {
        ...input,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Attendance Status request failed:",
      error.response?.data
    );
    throw error?.response?.data;
  }
}

export type RequestUpdateAttendanceStatusListService = {
  query: {
    id: string;
  };
  body: {
    isHidden?: boolean;
    color?: string;
    value?: number;
  };
};

type ResponseUpdateAttendanceStatusListService = AttendanceStatusList;

export async function UpdateAttendanceStatusListService(
  input: RequestUpdateAttendanceStatusListService
): Promise<ResponseUpdateAttendanceStatusListService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/attendance-status-lists`,
      data: {
        ...input,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Attendance Status request failed:",
      error.response?.data
    );
    throw error?.response?.data;
  }
}
