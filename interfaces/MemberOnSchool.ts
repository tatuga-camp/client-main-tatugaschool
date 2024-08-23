export interface MemberOnSchool {
  id: string;
  createAt: Date;
  updateAt: Date;
  status: Status;
  role: MemberRole;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  phone: string;
  userId: string;
  schoolId: string;
}

export enum Status {
  PENDDING,
  ACCEPT,
  REJECT,
}

export enum MemberRole {
  ADMIN,
  TEACHER,
}
