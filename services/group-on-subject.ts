import { GroupOnSubject, StudentOnGroup, UnitOnGroup } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type ResponseGetGroupOnSubjectsService = GroupOnSubject[];

export type RequestGetGroupOnSubjectsService = {
  subjectId: string;
};

export async function GetGroupOnSubjectsService(
  request: RequestGetGroupOnSubjectsService
): Promise<ResponseGetGroupOnSubjectsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/group-on-subjects/subject/${request.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseGetGroupOnSubjectService = GroupOnSubject & {
  units: (UnitOnGroup & { students: StudentOnGroup[] })[];
};

export type RequestGetGroupOnSubjectService = {
  groupOnSubjectId: string;
};

export async function GetGroupOnSubjectService(
  request: RequestGetGroupOnSubjectService
): Promise<ResponseGetGroupOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/group-on-subjects/${request.groupOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseCreateGroupOnSubjectService = GroupOnSubject & {
  units: (UnitOnGroup & { students: StudentOnGroup[] })[];
};

export type RequestCreateGroupOnSubjectService = {
  subjectId: string;
  title: string;
  description: string;
};

export async function CreateGroupOnSubjectService(
  request: RequestCreateGroupOnSubjectService
): Promise<ResponseCreateGroupOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/group-on-subjects/`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseUpdateGroupOnSubjectService = GroupOnSubject;

export type RequestUpdateGroupOnSubjectService = {
  query: {
    groupOnSubjectId: string;
  };
  body: {
    title?: string;
    description?: string;
  };
};

export async function UpdateGroupOnSubjectService(
  request: RequestUpdateGroupOnSubjectService
): Promise<ResponseUpdateGroupOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/group-on-subjects/`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseDeleteeGroupOnSubjectService = GroupOnSubject;

export type RequestDeleteeGroupOnSubjectService = {
  groupOnSubjectId: string;
};

export async function DeleteeGroupOnSubjectService(
  request: RequestDeleteeGroupOnSubjectService
): Promise<ResponseDeleteeGroupOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/group-on-subjects/${request.groupOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
