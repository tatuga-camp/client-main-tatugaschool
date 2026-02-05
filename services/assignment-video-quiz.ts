import { QuestionOnVideo } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateQuestionOnVideoService = {
  assignmentId: string;
  question: string;
  options: string[];
  correctOptions: number[];
  timestamp: number;
};

type ResponseCreateQuestionOnVideoService = QuestionOnVideo;

export async function CreateQuestionOnVideoService(
  input: RequestCreateQuestionOnVideoService,
): Promise<ResponseCreateQuestionOnVideoService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/assignment-video-quiz`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestGetQuestionOnVideoByAssignmentIdService = {
  assignmentId: string;
};

type ResponseGetQuestionOnVideoByAssignmentIdService = QuestionOnVideo[];

export async function GetQuestionOnVideoByAssignmentIdService(
  input: RequestGetQuestionOnVideoByAssignmentIdService,
): Promise<ResponseGetQuestionOnVideoByAssignmentIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/assignment-video-quiz/assignment/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestUpdateQuestionOnVideoService = {
  id: string;
  data: Partial<
    Omit<
      QuestionOnVideo,
      "id" | "createAt" | "updateAt" | "assignmentId" | "subjectId"
    >
  >;
};

type ResponseUpdateQuestionOnVideoService = QuestionOnVideo;

export async function UpdateQuestionOnVideoService(
  input: RequestUpdateQuestionOnVideoService,
): Promise<ResponseUpdateQuestionOnVideoService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/assignment-video-quiz/${input.id}`,
      data: input.data,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestDeleteQuestionOnVideoService = {
  id: string;
};

type ResponseDeleteQuestionOnVideoService = QuestionOnVideo;

export async function DeleteQuestionOnVideoService(
  input: RequestDeleteQuestionOnVideoService,
): Promise<ResponseDeleteQuestionOnVideoService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/assignment-video-quiz/${input.id}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
