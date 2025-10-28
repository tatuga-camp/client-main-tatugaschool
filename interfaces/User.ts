export type User = {
  id: string;
  createAt: Date;
  updateAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  blurHash?: string;
  photo: string;
  password?: string;
  role: UserRole;
  createBySchoolId?: string;
  isVerifyEmail: boolean;
  verifyEmailToken?: string;
  verifyEmailTokenExpiresAt?: Date;
  lastActiveAt: Date;
  isResetPassword: boolean;
  provider: Provider;
  isDeleted: boolean;
  deleteAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiresAt?: Date;
  language: Language;
  favoritSchool?: string;
};

export type Language = "en" | "th";

export type UserRole = "ADMIN" | "USER";
export type Provider = "LOCAL" | "GOOGLE";
