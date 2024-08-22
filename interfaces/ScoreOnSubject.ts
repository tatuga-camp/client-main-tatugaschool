import { School } from "./School";
import { ScoreOnStudent } from "./ScoreOnStudent";
import { Subject } from "./Subject";

export interface ScoreOnSubject {
  id: string;
  createAt: Date;
  updateAt: Date;
  score: number;
  title: string;
  icon: string;
  isDeleted: boolean;
  schoolId: string;
  school: School;
  subjectId: string;
  subject: Subject;
  scoreOnStudents: ScoreOnStudent[];
}
