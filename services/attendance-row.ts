import { Attendance, AttendanceRow, AttendanceType } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestGetAttendanceRowByTabelIdService = {
  attendanceTableId: string;
};

export async function GetAttendanceRowByTabelIdService(
  input: RequestGetAttendanceRowByTabelIdService
): Promise<(AttendanceRow & { attendances: Attendance[] })[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/attendance-rows/attendance-table/${input.attendanceTableId}`,
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
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/attendance-rows/${input.attendanceRowId}`,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch Attendance Row:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestCreateAttendanceRowService = {
  startDate: string;
  endDate: string;
  note?: string;
  attendanceTableId: string;
  type: AttendanceType;
  expireAt?: string;
  allowScanAt?: string;
  isAllowScanManyTime?: boolean;
};

export type ResponseCreateAttendanceRowService = AttendanceRow & {
  attendances: Attendance[];
};
export async function CreateAttendanceRowService(
  input: RequestCreateAttendanceRowService
): Promise<ResponseCreateAttendanceRowService> {
  try {
    const response = await axiosInstance({
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
  expireAt?: string;
  allowScanAt?: string;
  isAllowScanManyTime?: boolean;
};

export type RequestUpdateAttendanceRowService = {
  query: UpdateAttendanceRowQuery;
  body: UpdateAttendanceRowBody;
};

export async function UpdateAttendanceRowService(
  input: RequestUpdateAttendanceRowService
): Promise<AttendanceRow> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/attendance-rows`,
      data: input,
    });

    return response.data;
  } catch (error: any) {
    console.error("Attendance Row update failed:", error.response?.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteAttendanceRowService = {
  attendanceRowId: string;
};

export async function DeleteAttendanceRowService(
  input: RequestDeleteAttendanceRowService
): Promise<AttendanceRow> {
  try {
    const remove = await axiosInstance<AttendanceRow>({
      method: "DELETE",
      url: `/v1/attendance-rows/${input.attendanceRowId}`,
    });
    return remove.data;
  } catch (error: any) {
    console.error("Failed to delete Attendance Row:", error.response?.data);
    throw error?.response?.data;
  }
}
