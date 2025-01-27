import { MemberOnSchool, MemberRole, School } from "@/interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type ResponseGetMemberOnScholByUserIdService = (MemberOnSchool & {
  school: School;
})[];

export async function GetMemberOnScholByUserIdService(): Promise<ResponseGetMemberOnScholByUserIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/member-on-schools/user",
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestCreateMemberOnSchoolService = {
  email: string;
  role: MemberRole;
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

export type RequestUpdateMemberOnSchoolService = {
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
      url: `/v1/member-on-schools`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestDeleteMemberOnSchoolService = {
  memberOnSchoolId: string;
};

export async function DeleteMemberOnSchoolService(
  input: RequestDeleteMemberOnSchoolService
): Promise<MemberOnSchool> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/member-on-schools/${input.memberOnSchoolId}`,
    });

    return response.data;
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

export type RequestUpdateMemberInvitationService = {
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
      data: input,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
