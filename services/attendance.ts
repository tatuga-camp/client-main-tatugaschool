import axios from "axios";
import { parseCookies } from "nookies";
import { Attendance } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

export async function GetAttendanceByIdService(
  attendanceId: string
): Promise<Attendance> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/attendances/${attendanceId}`,
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
    const response = await axios({
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
