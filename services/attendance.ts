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

export type RequestUpdateAttendanceService = {
  query: {
    attendanceId: string;
  };
  body: {
    status?: string;
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
      url: `/v1/attendances`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Attendance request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateManyAttendanceService = {
  query: {
    attendanceId: string;
  };
  body: {
    status?: string;
    note?: string;
  };
}[];

type ResponseUpdateManyAttendanceService = Attendance[];

export async function UpdateManyAttendanceService(
  input: RequestUpdateManyAttendanceService
): Promise<ResponseUpdateManyAttendanceService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/attendances/many`,
      data: { data: input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Attendance request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestCreateAttendanceService = {
  attendanceRowId: string;
  studentOnSubjectId: string;
  status: string;
  note?: string;
};

type ResponseCreateAttendanceService = Attendance;

export async function CreateAttendanceService(
  input: RequestCreateAttendanceService
): Promise<ResponseCreateAttendanceService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/attendances`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Attendance request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestExportAttendanceService = {
  subjectId: string;
};

export async function ExportAttendanceService(
  input: RequestExportAttendanceService
): Promise<string> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/attendances/export-excel/?subjectId=${input.subjectId}`,
      responseType: "text",
    });
    return response.data;
  } catch (error: any) {
    console.error("Export Attendance request failed:", error);
    throw error?.response?.data;
  }
}
