import { Skill } from "./Skill";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { Subject } from "./Subject";

export interface SkillOnStudentAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  weight: number;
  subjectId: string;
  subject: Subject;
  skillId: string;
  skill: Skill;
  studentOnAssignmentId: string;
  studentOnAssignment: StudentOnAssignment;
}
