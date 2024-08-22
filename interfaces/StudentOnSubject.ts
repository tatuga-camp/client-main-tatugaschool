import { Attendance } from "./Attendance";
import { Class } from "./Class";
import { School } from "./School";
import { ScoreOnStudent } from "./ScoreOnStudent";
import { Student } from "./Student";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { Subject } from "./Subject";

export interface StudentOnSubject {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  picture: string;
  number: string;
  totalSpeicalScore: number;
  studentId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
  school: School;
  class: Class;
  subject: Subject;
  student: Student;
  studentOnAssignments: StudentOnAssignment[];
  scoreOnStudents: ScoreOnStudent[];
  attendances: Attendance[];
}
