import {
  WordCloud,
  WordCloudAccess,
  WordCloudSet,
  WordCloudSetDetail,
  WordCloudStatus,
} from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestGetWordCloudSetsBySubject = { subjectId: string };

export async function GetWordCloudSetsBySubjectService(
  input: RequestGetWordCloudSetsBySubject,
): Promise<WordCloudSet[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/word-cloud-sets/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word cloud sets failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGetWordCloudSetById = { setId: string };

export async function GetWordCloudSetByIdService(
  input: RequestGetWordCloudSetById,
): Promise<WordCloudSetDetail> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/word-cloud-sets/${input.setId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word cloud set failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestCreateWordCloudSet = {
  subjectId: string;
  questions: string[];
  title?: string;
  accessMode?: WordCloudAccess;
  allowMultiple?: boolean;
};

export async function CreateWordCloudSetService(
  input: RequestCreateWordCloudSet,
): Promise<WordCloudSet> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/word-cloud-sets`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create word cloud set failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateWordCloudSet = {
  setId: string;
  title?: string;
  activeWordCloudId?: string;
  status?: WordCloudStatus;
  accessMode?: WordCloudAccess;
  allowMultiple?: boolean;
};

export async function UpdateWordCloudSetService(
  input: RequestUpdateWordCloudSet,
): Promise<WordCloudSet> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/word-cloud-sets`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Update word cloud set failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestAppendQuestion = { setId: string; question: string };

export async function AppendWordCloudQuestionService(
  input: RequestAppendQuestion,
): Promise<WordCloud> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/word-cloud-sets/${input.setId}/questions`,
      data: { question: input.question },
    });
    return response.data;
  } catch (error: any) {
    console.error("Append question failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteWordCloudSet = { setId: string };

export async function DeleteWordCloudSetService(
  input: RequestDeleteWordCloudSet,
): Promise<WordCloudSet> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/word-cloud-sets/${input.setId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete word cloud set failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestShareWordCloudSetResults = { setId: string };

export async function ShareWordCloudSetResultsService(
  input: RequestShareWordCloudSetResults,
): Promise<WordCloudSet> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/word-cloud-sets/${input.setId}/share-results`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Share word cloud results failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestRevokeWordCloudSetResults = { setId: string };

export async function RevokeWordCloudSetResultsService(
  input: RequestRevokeWordCloudSetResults,
): Promise<WordCloudSet> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/word-cloud-sets/${input.setId}/share-results`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Revoke word cloud results failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
