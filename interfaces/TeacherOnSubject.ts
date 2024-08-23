import { MemberRole, Status } from "./MemberOnSchool";

export interface TeacherOnSubject {
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
  subjectId: string;
  schoolId: string;
}
