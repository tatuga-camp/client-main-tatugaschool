import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateSubscriptionService = {
  priceId: string;
  schoolId: string;
  members: number;
  discountCode?: string;
};

type ResponseCreateSubscriptionService = {
  subscriptionId: string;
  clientSecret: string | null;
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

export type RequestValidateDiscountService = {
  code: string;
  schoolId: string;
  priceId?: string;
  members?: number;
};

export type ResponseValidateDiscountService =
  | {
      valid: true;
      discount: { type: "percent" | "amount"; value: number };
      originalAmount: number;
      discountedAmount: number;
      currency: string;
    }
  | { valid: false; reason: string };

export async function ValidateDiscountService(
  input: RequestValidateDiscountService,
): Promise<ResponseValidateDiscountService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subscriptions/discounts/validate`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Validate discount request failed:", error?.response);
    throw error?.response?.data;
  }
}

export type RequestApplyDiscountService = {
  code: string;
  schoolId: string;
};

export type ResponseApplyDiscountService = {
  success: true;
  discount: { type: "percent" | "amount"; value: number };
};

export async function ApplyDiscountService(
  input: RequestApplyDiscountService,
): Promise<ResponseApplyDiscountService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subscriptions/discounts/apply`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Apply discount request failed:", error?.response);
    throw error?.response?.data;
  }
}

export type RequestUpgradeService = {
  schoolId: string;
  priceId: string;
  members?: number;
};

export type ResponseUpgradePreviewService =
  | {
      valid: true;
      currentPlan: string;
      newPlan: string;
      prorationCharge: number;
      prorationCredit: number;
      amountDue: number;
      currency: string;
    }
  | { valid: false; reason: string };

export async function UpgradePreviewService(
  input: RequestUpgradeService,
): Promise<ResponseUpgradePreviewService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subscriptions/upgrade/preview`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Upgrade preview request failed:", error?.response);
    throw error?.response?.data;
  }
}

export type ResponseUpgradeService = {
  subscriptionId: string;
  clientSecret: string | null;
  price: number;
};

export async function UpgradeSubscriptionService(
  input: RequestUpgradeService,
): Promise<ResponseUpgradeService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/subscriptions/upgrade`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Upgrade request failed:", error?.response);
    throw error?.response?.data;
  }
}
