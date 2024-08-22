import { School } from "./School";
import { Student } from "./Student";
import { StudentOnSubject } from "./StudentOnSubject";
import { Subject } from "./Subject";

export interface Class {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  level: string;
  description?: string;
  educationYear: Date;
  order: number;
  schoolId: string;
  school: School;
  subjects: Subject[];
  students: Student[];
  studentOnSubjects: StudentOnSubject[];
}
