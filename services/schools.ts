import { School, User } from "@/interfaces";

import createAxiosInstance from "./apiService";
import { getAccessToken } from "../utils";
import axios from "axios";

const axiosInstance = createAxiosInstance();

export type RequestCreateSchoolService = {
  title: string;
  description: string;
  blurHash: string;
  country: string;
  city: string;
  address: string;
  zipCode: string;
  logo: string;
  phoneNumber: string;
};

export type ResponseSchoolService = School;

export async function CreateSchoolService(
  input: RequestCreateSchoolService
): Promise<ResponseSchoolService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/schools",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestUpdateSchoolService = {
  query: { schoolId: string };
  body: {
    title?: string;
    description?: string;
    billingManagerId?: string;
    logo?: string;
  };
};

export async function UpdateSchoolService(
  input: RequestUpdateSchoolService
): Promise<ResponseSchoolService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/schools/`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestDeleteSchoolService = {
  schoolId: string;
};

type ResponseDeleteSchoolService = School;

export async function DeleteSchoolService(
  input: RequestDeleteSchoolService
): Promise<ResponseDeleteSchoolService> {
  try {
    const response = await axiosInstance({
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

export type ResponseGetSchoolService = School & {
  user: User;
  totalClass: number;
  totalTeacher: number;
  totalSubject: number;
};

export async function GetSchoolByIdService(
  input: RequestGetSchoolService
): Promise<ResponseGetSchoolService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/schools/${input.schoolId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetSchoolService(): Promise<ResponseSchoolService[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/schools`,
    });

    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
