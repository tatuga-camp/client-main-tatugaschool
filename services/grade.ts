import { Grade } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();
export type RequestCreateGradeService = {
  subjectId: string;
  gradeRanges: { min: number; max: number; grade: string }[];
};

type ResponseCreateGradeService = Grade;

export async function CreateGradeService(
  input: RequestCreateGradeService,
): Promise<ResponseCreateGradeService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/grades`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Grades request failed:", error?.response);
    throw error?.response?.data;
  }
}
export type RequestUpdateGradeService = {
  query: {
    gradeRangeId: string;
  };
  body: {
    gradeRanges: { min: number; max: number; grade: string }[];
  };
};

type ResponseUpdateGradeService = Grade;

export async function UpdateGradeService(
  input: RequestUpdateGradeService,
): Promise<ResponseUpdateGradeService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/grades`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Grades request failed:", error?.response);
    throw error?.response?.data;
  }
}
