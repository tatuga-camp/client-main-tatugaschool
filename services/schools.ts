import { School } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateSchoolService = {
  title: string;
  description: string;
};

export type ResponseSchoolService = School;

export async function CreateSchoolService(
  input: RequestCreateSchoolService
): Promise<ResponseSchoolService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/schools",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestUpdateSchoolService = {
  query: { schoolId: string };
  body: {
    title?: string;
    description?: string;
    billingManagerId?: string;
  };
};

export async function UpdateSchoolService(
  input: RequestUpdateSchoolService
): Promise<ResponseSchoolService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/schools/${input.query.schoolId}`,
      data: input.body,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestDeleteSchoolService = {
  schoolId: string;
};

type ResponseDeleteSchoolService = {
  message: string;
}

export async function DeleteSchoolService(
  input: RequestDeleteSchoolService
): Promise<ResponseDeleteSchoolService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/schools/${input.schoolId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetSchoolService = {
  schoolId: string;
};

export async function GetSchoolService(
  input: RequestGetSchoolService
): Promise<ResponseSchoolService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/schools/${input.schoolId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}