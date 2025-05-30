import { Career, Skill } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestGetSuggestCareerService = {
  studentId: string;
};

type ResponseGetSuggestCareerService = {
  careers: Career;
  skills: {
    skill: Skill;
    average: number;
  }[];
};

export async function GetSuggestCareerService(
  input: RequestGetSuggestCareerService,
): Promise<ResponseGetSuggestCareerService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/careers/suggest/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Classroom request failed:", error.response.data);
    throw error?.response?.data;
  }
}
