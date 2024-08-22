import { Assignment } from "./Assignment";
import { CommentOnAssignmentStudent } from "./CommentOnAssignmentStudent";
import { CommentOnAssignmentTeacher } from "./CommentOnAssignmentTeacher";
import { FileOnStudentOnAssignment } from "./FileOnStudentOnAssignment";
import { School } from "./School";
import { SkillOnStudentAssignment } from "./SkillOnStudentAssignment";
import { Student } from "./Student";
import { StudentOnSubject } from "./StudentOnSubject";
import { Subject } from "./Subject";

export interface StudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  picture: string;
  number: string;
  score: number;
  body: string;
  isCompleted: boolean;
  isReviewed: boolean;
  studentId: string;
  assignmentId: string;
  studentOnSubjectId: string;
  schoolId: string;
  subjectId: string;
  subject: Subject;
  school: School;
  student: Student;
  assignment: Assignment;
  studentOnSubject: StudentOnSubject;
  fileOnStudentOnAssignments: FileOnStudentOnAssignment[];
  commentOnAssignmentStudents: CommentOnAssignmentStudent[];
  commentOnAssignmentTeachers: CommentOnAssignmentTeacher[];
  skillOnStudentAssignments: SkillOnStudentAssignment[];
}
