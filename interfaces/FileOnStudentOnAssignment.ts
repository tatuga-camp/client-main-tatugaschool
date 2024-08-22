import { School } from "./School";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { Subject } from "./Subject";

export interface FileOnStudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  type: string;
  url: string;
  size: number;
  subjectId: string;
  subject: Subject;
  schoolId: string;
  school: School;
  studentOnAssignmentId: string;
  studentOnAssignment: StudentOnAssignment;
}
