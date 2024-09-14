import { ScoreOnSubject } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateScoreOnSubjectService = {
  score: number;
  title: string;
  icon: string;
  schoolId: string;
  subjectId: string;
};

export type ResponseScoreOnSubjectService = ScoreOnSubject;

export async function CreateScoreOnSubjectService(
  input: RequestCreateScoreOnSubjectService
): Promise<ResponseScoreOnSubjectService> {
  try {
    const response = await axios({
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
  input: RequestGetScoresOnSubjectBySubjectIdService
): Promise<ResponseScoreOnSubjectService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/score-on-subjects/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch scores by subject ID:",
      error.response?.data
    );
    throw error?.response?.data;
  }
}

type RequestUpdateScoreOnSubjectService = {
  score: number;
  title?: string;
  icon?: string;
};

export async function UpdateScoreOnSubjectService(
  scoreId: string,
  input: RequestUpdateScoreOnSubjectService
): Promise<ResponseScoreOnSubjectService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/score-on-subjects/${scoreId}`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update score on subject:", error.response?.data);
    throw error?.response?.data;
  }
}
