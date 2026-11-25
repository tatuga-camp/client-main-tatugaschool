import { LineGroupOnSubject, LineGroupSwitch } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestGetLineGroupsService = {
  subjectId: string;
};

export async function GetLineGroupsService(
  input: RequestGetLineGroupsService,
): Promise<LineGroupOnSubject[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/subjects/${input.subjectId}/line-groups`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get LINE groups request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateLineGroupService = {
  id: string;
  body: Partial<Record<LineGroupSwitch, boolean>>;
};

export async function UpdateLineGroupService(
  input: RequestUpdateLineGroupService,
): Promise<LineGroupOnSubject> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/subjects/line-groups/${input.id}`,
      data: input.body,
    });
    return response.data;
  } catch (error: any) {
    console.error("Update LINE group request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestDisconnectLineGroupService = {
  id: string;
};

export async function DisconnectLineGroupService(
  input: RequestDisconnectLineGroupService,
): Promise<LineGroupOnSubject> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/subjects/line-groups/${input.id}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Disconnect LINE group request failed:",
      error?.response?.data,
    );
    throw error?.response?.data;
  }
}
