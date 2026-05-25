export type MemberOnSchool = {
  id: string;
  createAt: Date;
  updateAt: Date;
  status: Status;
  role: MemberRole;
  firstName: string | null;
  lastName: string | null;
  email: string;
  blurHash: string | null;
  photo: string | null;
  phone: string | null;
  userId: string | null;
  schoolId: string;
  invitationToken?: string | null;
  invitationTokenExpiresAt?: string | null;
};

export type Status = "PENDDING" | "ACCEPT" | "REJECT";

export type MemberRole = "TEACHER" | "ADMIN";
