import { Assignment } from "./Assignment";
import { Skill } from "./Skill";
import { Subject } from "./Subject";

export interface SkillOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  skillId: string;
  assignmentId: string;
  subjectId: string;
  subject: Subject;
  skill: Skill;
  assignment: Assignment;
}
