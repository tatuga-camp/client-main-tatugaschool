import { SchoolAnalytics, StudentInsightDetail } from "@/interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestGetSchoolAnalyticsService = {
  schoolId: string;
  educationYear: string;
};

export async function GetSchoolAnalyticsService(
  input: RequestGetSchoolAnalyticsService,
): Promise<SchoolAnalytics> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/schools/${input.schoolId}/analytics`,
      params: { educationYear: input.educationYear },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetStudentInsightDetailService(input: {
  schoolId: string;
  studentId: string;
  educationYear: string;
}): Promise<StudentInsightDetail> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/schools/${input.schoolId}/analytics/students/${input.studentId}`,
      params: { educationYear: input.educationYear },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
