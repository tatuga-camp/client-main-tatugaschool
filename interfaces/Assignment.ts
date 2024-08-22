import { FileOnAssignment } from "./FileOnAssignment";
import { School } from "./School";
import { SkillOnAssignment } from "./SkillOnAssignment";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { Subject } from "./Subject";

export interface Assignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: Date;
  dueDate: Date;
  subjectId: string;
  subject: Subject;
  schoolId: string;
  school: School;
  fileOnAssignments: FileOnAssignment[];
  studentOnAssignments: StudentOnAssignment[];
  skillOnAssignments: SkillOnAssignment[];
}
