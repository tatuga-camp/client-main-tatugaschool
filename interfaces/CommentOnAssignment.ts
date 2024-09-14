import { MemberRole, Status } from "./MemberOnSchool";

export interface CommentOnAssignment {
  id: string;
  createAt: string;
  updateAt: string;
  content: string;
  title: string;
  firstName: string;
  lastName: string;
  picture?: string;
  number?: string;
  status: Status;
  role: MemberRole;
  email?: string;
  phone?: string;
  subjectId: string;
  schoolId: string;
  studentId?: string;
  studentOnAssignmentId: string;
  teacherOnSubjectId?: string;
  userId?: string;
}
