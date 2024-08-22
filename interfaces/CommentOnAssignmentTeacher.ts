import { Status, MemberRole } from "./MemberOnSchool";
import { School } from "./School";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { Subject } from "./Subject";
import { User } from "./user";

export interface CommentOnAssignmentTeacher {
  id: string;
  createAt: Date;
  updateAt: Date;
  content: string;
  status: Status;
  role: MemberRole;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  phone: string;
  subjectId: string;
  subject: Subject;
  userId: string;
  user: User;
  schoolId: string;
  school: School;
  studentOnAssignmentId: string;
  studentOnAssignment: StudentOnAssignment;
}
