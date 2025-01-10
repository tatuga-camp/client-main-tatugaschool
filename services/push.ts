import { subscribeUserToPush } from "../utils/notifications";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export async function SubscribeToPushService(): Promise<any> {
  try {
    const subscription = await subscribeUserToPush();
    const userAgent = navigator.userAgent;
    if (!subscription) {
      throw new Error("Subscription failed");
    }
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/push/subscribe`,
      data: { payload: subscription, userAgent },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
