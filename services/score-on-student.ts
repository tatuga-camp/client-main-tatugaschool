import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateScoreOnStudentService = {
  studentOnSubjectId: string;
  scoreOnSubjectId: string;
  score: number;
};

export type ResponseScoreOnStudentService = {
  id: string;
  score: number;
  studentOnSubjectId: string;
  scoreOnSubjectId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export async function CreateScoreOnStudentService(
  input: RequestCreateScoreOnStudentService
): Promise<ResponseScoreOnStudentService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/score-on-students",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create score on student:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestGetScoresBySubjectIdService = {
  subjectId: string;
};

export async function GetScoresBySubjectIdService(
  input: RequestGetScoresBySubjectIdService
): Promise<ResponseScoreOnStudentService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/score-on-students/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch scores by subject ID:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestGetScoresByStudentOnSubjectIdService = {
  studentOnSubjectId: string;
};

export async function GetScoresByStudentOnSubjectIdService(
  input: RequestGetScoresByStudentOnSubjectIdService
): Promise<ResponseScoreOnStudentService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/score-on-students/studentOnSubject/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch scores by studentOnSubjectId:", error.response?.data);
    throw error?.response?.data;
  }
}
export type RequestDeleteScoreOnStudentService = {
    scoreOnStudentId: string;
  };
export type ResponseDeleteScoreOnStudentService = {
    message: string;
  };
  

  export async function DeleteScoreOnStudentService(
    input: RequestDeleteScoreOnStudentService
  ): Promise<ResponseDeleteScoreOnStudentService> {
    try {
      const response = await axios({
        method: "DELETE",
        url: `/v1/score-on-students/${input.scoreOnStudentId}`,
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to delete score on student:", error.response?.data);
      throw error?.response?.data;
    }
  }