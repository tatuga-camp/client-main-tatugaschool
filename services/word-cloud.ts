import { WordCloud, WordCloudAccess, WordCloudDetail, WordCloudStatus } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestGetWordCloudsBySubjectService = { subjectId: string };

export async function GetWordCloudsBySubjectService(
  input: RequestGetWordCloudsBySubjectService,
): Promise<WordCloud[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/word-clouds/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word clouds failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGetWordCloudByIdService = { wordCloudId: string };

export async function GetWordCloudByIdService(
  input: RequestGetWordCloudByIdService,
): Promise<WordCloudDetail> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/word-clouds/${input.wordCloudId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word cloud failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestCreateWordCloudService = {
  question: string;
  subjectId: string;
  accessMode?: WordCloudAccess;
  allowMultiple?: boolean;
};

export async function CreateWordCloudService(
  input: RequestCreateWordCloudService,
): Promise<WordCloud> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/word-clouds`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create word cloud failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateWordCloudService = {
  query: { wordCloudId: string };
  body: {
    question?: string;
    status?: WordCloudStatus;
    accessMode?: WordCloudAccess;
    allowMultiple?: boolean;
  };
};

export async function UpdateWordCloudService(
  input: RequestUpdateWordCloudService,
): Promise<WordCloud> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/word-clouds`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Update word cloud failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteWordCloudService = { wordCloudId: string };

export async function DeleteWordCloudService(
  input: RequestDeleteWordCloudService,
): Promise<WordCloud> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/word-clouds/${input.wordCloudId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete word cloud failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
