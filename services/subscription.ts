import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateSubscriptionService = {
  priceId: string;
  schoolId: string;
  members: number;
};

type ResponseCreateSubscriptionService = {
  subscriptionId: string;
  clientSecret: string;
  price: number;
};

export async function CreateSubscriptionService(
  input: RequestCreateSubscriptionService,
): Promise<ResponseCreateSubscriptionService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subscriptions`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create subscriptions request failed:", error?.response);
    throw error?.response?.data;
  }
}

export type RequestGetManageSubscriptionService = {
  schoolId: string;
};

type ResponseGetManageSubscriptionService = {
  url: string;
};

export async function GetManageSubscriptionService(
  input: RequestGetManageSubscriptionService,
): Promise<ResponseGetManageSubscriptionService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subscriptions/manage/${input.schoolId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create subscriptions request failed:", error?.response);
    throw error?.response?.data;
  }
}

type ResponseGetListSubscriptionService = {
  title: string;
  priceId: string;
  time: "year" | "month";
}[];

export async function GetListSubscriptionService(): Promise<ResponseGetListSubscriptionService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/subscriptions/products`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Create subscriptions request failed:", error?.response);
    throw error?.response?.data;
  }
}
