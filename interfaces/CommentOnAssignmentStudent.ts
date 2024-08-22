import { School } from "./School";
import { Student } from "./Student";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { Subject } from "./Subject";

export interface CommentOnAssignmentStudent {
  id: string;
  createAt: Date;
  updateAt: Date;
  content: string;
  title: string;
  firstName: string;
  lastName: string;
  picture: string;
  number: string;
  subjectId: string;
  subject: Subject;
  schoolId: string;
  school: School;
  studentId: string;
  student: Student;
  studentOnAssignmentId: string;
  studentOnAssignment: StudentOnAssignment;
}
