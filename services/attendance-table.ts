import {
  AttendanceStatusList,
  AttendanceTable,
} from "@/interfaces/AttendanceTable";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();
type RequestGetAttendanceTablesService = {
  subjectId: string;
};

export type ResponseGetAttendanceTablesService = (AttendanceTable & {
  statusLists: AttendanceStatusList[];
})[];

export async function GetAttendanceTablesService(
  input: RequestGetAttendanceTablesService,
): Promise<ResponseGetAttendanceTablesService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/attendance-tables/subject/${input.subjectId}`,
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
  input: RequestGetAttendanceTableByIdService,
): Promise<ResponseGetAttendanceTableByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/attendance-tables/${input.attendanceTableId}`,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch Attendance Table:", error.response?.data);
    throw error?.response?.data;
  }
}

export type RequestCreateAttendanceTableService = {
  title: string;
  description?: string;
  subjectId: string;
};

type ResponseCreateAttendanceTableService = AttendanceTable;

export async function CreateAttendanceTableService(
  input: RequestCreateAttendanceTableService,
): Promise<ResponseCreateAttendanceTableService> {
  try {
    const response = await axiosInstance({
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
export type RequestUpdateAttendanceTableService = {
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
  input: RequestUpdateAttendanceTableService,
): Promise<ResponseUpdateAttendanceTableService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/attendance-tables`,
      data: {
        ...input,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Attendance Table request failed:",
      error.response?.data,
    );
    throw error?.response?.data;
  }
}
export type RequestDeleteAttendanceTableService = {
  attendanceTableId: string;
};

type ResponseDeleteAttendanceTableService = AttendanceTable;

export async function DeleteAttendanceTableService(
  input: RequestDeleteAttendanceTableService,
): Promise<ResponseDeleteAttendanceTableService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/attendance-tables/${input.attendanceTableId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Attendance Table request failed:",
      error.response?.data,
    );
    throw error?.response?.data;
  }
}
