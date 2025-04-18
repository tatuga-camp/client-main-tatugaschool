import createAxiosInstance from "./apiService";

export enum FeedbackTag {
  COMPLIMENT = 'COMPLIMENT',
  BUG = 'BUG',
  REQUEST_FEATURE = 'REQUEST_FEATURE',
}

const axiosInstance = createAxiosInstance();

export type RequestCreateFeedbackService = {
  title: string;
  body: string;
  tag: FeedbackTag;
};

export type ResponseFeedbackService = {
  id: string;
  title: string;
  body: string;
  tag: FeedbackTag;
  createdAt: string;
};

export async function CreateFeedbackService(
  input: RequestCreateFeedbackService
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