import { School } from "./School";
import { ScoreOnSubject } from "./ScoreOnSubject";
import { Student } from "./Student";
import { StudentOnSubject } from "./StudentOnSubject";
import { Subject } from "./Subject";

export interface ScoreOnStudent {
  id: string;
  createAt: Date;
  updateAt: Date;
  score: number;
  title: string;
  icon: string;
  subjectId: string;
  subject: Subject;
  scoreOnSubjectId: string;
  scoreOnSubject: ScoreOnSubject;
  schoolId: string;
  school: School;
  studentId: string;
  student: Student;
  studentOnSubjectId: string;
  studentOnSubject: StudentOnSubject;
}
