import { Feedback, FeedbackTag } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateFeedbackService = {
  body: string;
  tag: FeedbackTag;
  private: boolean;
  files?: {
    url: string;
    type: string;
    size: number;
  }[];
};

export type ResponseFeedbackService = Feedback & {
  fileOnFeedbacks?: {
    id: string;
    url: string;
    type: string;
    size: number;
  }[];
};

export type RequestGetFeedbacksService = {
  page?: number;
  limit?: number;
  tag?: FeedbackTag;
};

export type ResponseGetFeedbacksService = {
  items: ResponseFeedbackService[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function CreateFeedbackService(
  input: RequestCreateFeedbackService,
): Promise<ResponseFeedbackService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/feedbacks",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetFeedbacksService(
  query?: RequestGetFeedbacksService,
): Promise<ResponseGetFeedbacksService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/feedbacks",
      params: query,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function DeleteFeedbackService(
  feedbackId: string,
): Promise<ResponseFeedbackService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/feedbacks/${feedbackId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
