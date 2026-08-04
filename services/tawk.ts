import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type ResponseGetUserTawkHashService = {
  userId: string;
  hash: string;
};

export async function GetUserTawkHashService(): Promise<ResponseGetUserTawkHashService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/users/me/tawk-hash",
    });
    return response.data;
  } catch (error: any) {
    console.error("Tawk hash request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
