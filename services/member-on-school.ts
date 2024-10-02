import { MemberOnSchool } from "@/interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateMemberOnSchoolService = {
  email: string;
  role: string;
  schoolId: string;
};

export type ResponseMemberOnSchoolService = MemberOnSchool;

export async function CreateMemberOnSchoolService(
  input: RequestCreateMemberOnSchoolService
): Promise<ResponseMemberOnSchoolService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/member-on-schools",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestUpdateMemberOnSchoolService = {
  query: { memberOnSchoolId: string };
  body: {
    role?: string;
    status?: string;
  };
};

export async function UpdateMemberOnSchoolService(
  input: RequestUpdateMemberOnSchoolService
): Promise<ResponseMemberOnSchoolService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/member-on-schools/${input.query.memberOnSchoolId}`,
      data: input.body,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestDeleteMemberOnSchoolService = {
  memberOnSchoolId: string;
};

export async function DeleteMemberOnSchoolService(
  input: RequestDeleteMemberOnSchoolService
): Promise<void> {
  try {
    await axiosInstance({
      method: "DELETE",
      url: `/v1/member-on-schools/${input.memberOnSchoolId}`,
    });
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetMembersBySchoolIdService = {
  schoolId: string;
};

export async function GetMembersBySchoolIdService(
  input: RequestGetMembersBySchoolIdService
): Promise<ResponseMemberOnSchoolService[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/member-on-schools/school/${input.schoolId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetMembersByUserIdService = {
  userId: string;
};

export async function GetMembersByUserIdService(
  input: RequestGetMembersByUserIdService
): Promise<ResponseMemberOnSchoolService[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/member-on-schools/user/${input.userId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestUpdateMemberInvitationService = {
  query: { memberOnSchoolId: string };
  body: {
    status: string;
  };
};

export async function UpdateMemberInvitationService(
  input: RequestUpdateMemberInvitationService
): Promise<{ message: string }> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/member-on-schools/invitation`,
      data: input.body,
      params: { memberOnSchoolId: input.query.memberOnSchoolId },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
