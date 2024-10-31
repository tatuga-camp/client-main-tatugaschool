export type MemberOnSchool = {
  id: string;
  createAt: Date;
  updateAt: Date;
  status: Status;
  role: MemberRole;
  firstName: string;
  lastName: string;
  email: string;
  blurHash: string;
  photo: string;
  phone: string;
  userId: string;
  schoolId: string;
};

export type Status = "PENDDING" | "ACCEPT" | "REJECT";

export type MemberRole = "TEACHER" | "ADMIN" | "REMOVE";
