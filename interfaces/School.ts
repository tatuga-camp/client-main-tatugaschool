export interface School {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  zipCode: string;
  logo: string;
  blurHash?: string;
  phoneNumber: string;
  plan: Plan;
  isDeleted: boolean;
  stripe_customer_id: string;
  stripe_price_id?: string;
  stripe_subscription_id?: string;
  stripe_subscription_expireAt?: Date;
  billingManagerId?: string;
  totalStorage: number;
  limitSchoolMember: number;
  limitClassNumber: number;
  limitSubjectNumber: number;
  limitTotalStorage: number;
}

export type Plan = "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE";
