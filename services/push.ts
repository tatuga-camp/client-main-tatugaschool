
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export async function SubscribeToPushService(
  input: any
): Promise<any> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/push/subscribe`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
