import { Status, MemberRole } from "./MemberOnSchool";
import { School } from "./School";
import { Subject } from "./Subject";
import { User } from "./user";

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
  user: User;
  subject: Subject;
  school: School;
}
