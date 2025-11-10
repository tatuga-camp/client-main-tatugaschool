import { Notification } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type ResponseGetUnreadNotificationService = Notification[];
export async function GetUnreadNotificationService(): Promise<ResponseGetUnreadNotificationService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "v1/notifications",
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseMarkAllAsReadNotificationService = { count: number };
export async function MarkAllAsReadNotificationService(): Promise<ResponseMarkAllAsReadNotificationService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "v1/notifications/mark-as-read",
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseMarkAsReadNotificationService = { count: number };
export type RequestMarkAsReadNotificationService = { id: string };

export async function MarkAsReadNotificationService(
  request: RequestMarkAsReadNotificationService,
): Promise<ResponseMarkAsReadNotificationService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `v1/notifications/mark-as-read/${request.id}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
