import { Assignment } from "./Assignment";
import { School } from "./School";
import { Subject } from "./Subject";

export interface FileOnAssignment {
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
  assignmentId: string;
  assignment: Assignment;
}
