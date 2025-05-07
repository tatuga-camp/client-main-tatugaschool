import { UnitOnGroup } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type ResponseCreateUnitOnGroupService = UnitOnGroup;

export type RequestCreateUnitOnGroupService = {
  groupOnSubjectId: string;
  icon: string;
  title: string;
  description?: string;
  order: number;
};

export async function CreateUnitOnGroupService(
  request: RequestCreateUnitOnGroupService
): Promise<ResponseCreateUnitOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/unit-on-groups`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseUpdateUnitOnGroupService = UnitOnGroup;

export type RequestUpdateUnitOnGroupService = {
  query: {
    unitOnGroupId: string;
  };
  body: {
    icon?: string;
    title?: string;
    description?: string;
    score?: number;
    order?: number;
  };
};

export async function UpdateUnitOnGroupService(
  request: RequestUpdateUnitOnGroupService
): Promise<ResponseUpdateUnitOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/unit-on-groups`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseReorderUnitOnGroupService = UnitOnGroup[];

export type RequestReorderUnitOnGroupService = {
  unitOnGroupIds: string[];
};

export async function ReorderUnitOnGroupService(
  request: RequestReorderUnitOnGroupService
): Promise<ResponseReorderUnitOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/unit-on-groups/reorder`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseDeleteUnitOnGroupService = UnitOnGroup;

export type RequestDeleteUnitOnGroupService = {
  unitOnGroupId: string;
};

export async function DeleteUnitOnGroupService(
  request: RequestDeleteUnitOnGroupService
): Promise<ResponseDeleteUnitOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/unit-on-groups/${request.unitOnGroupId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
