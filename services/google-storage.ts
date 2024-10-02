

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestGetSignedURL = {
  fileName: string;
  fileType: string;
};

type ResponseGetSignedURL = {
  signURL: string;
  originalURL: string;
  contentType: string;
  fileName: string;
};

export async function getSignedURLStudentService(
  input: RequestGetSignedURL
): Promise<ResponseGetSignedURL> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/google-storage/get-signURL/student",
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Signed URL request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function getSignedURLTeacherService(
  input: RequestGetSignedURL
): Promise<ResponseGetSignedURL> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/google-storage/get-signURL/teacher",
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Signed URL request failed:", error.response.data);
    throw error?.response?.data;
  }
}
