import { ScoreOnSubject } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateScoreOnSubjectService = {
  score: number;
  title: string;
  icon: string;
  blurHash: string;
  subjectId: string;
};

export type ResponseScoreOnSubjectService = ScoreOnSubject;

export async function CreateScoreOnSubjectService(
  input: RequestCreateScoreOnSubjectService,
): Promise<ResponseScoreOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/score-on-subjects",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create score on subject:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestGetScoresOnSubjectBySubjectIdService = {
  subjectId: string;
};

export async function GetScoresOnSubjectBySubjectIdService(
  input: RequestGetScoresOnSubjectBySubjectIdService,
): Promise<ResponseScoreOnSubjectService[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/score-on-subjects/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch scores by subject ID:",
      error.response?.data,
    );
    throw error?.response?.data;
  }
}

export type RequestUpdateScoreOnSubjectService = {
  query: {
    socreOnSubjectId: string;
  };
  body: {
    score?: number;
    title?: string;
    icon?: string;
    blurHash?: string;
    weight?: number | null;
    maxScore?: number | null;
  };
};

export async function UpdateScoreOnSubjectService(
  input: RequestUpdateScoreOnSubjectService,
): Promise<ResponseScoreOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/score-on-subjects`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update score on subject:", error.response?.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteScoreOnSubjectService = {
  scoreOnSubjectId: string;
};

export async function DeleteScoreOnSubjectService(
  input: RequestDeleteScoreOnSubjectService,
): Promise<ResponseScoreOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/score-on-subjects/${input.scoreOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to Delete score on subject:", error.response?.data);
    throw error?.response?.data;
  }
}
