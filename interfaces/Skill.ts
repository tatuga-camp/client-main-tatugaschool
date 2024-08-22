import { SkillOnAssignment } from "./SkillOnAssignment";
import { SkillOnCareer } from "./SkillOnCareer";
import { SkillOnStudentAssignment } from "./SkillOnStudentAssignment";

export interface Skill {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  keywords: string;
  vector: number[];
  skillOnAssignments: SkillOnAssignment[];
  skillOnStudentAssignments: SkillOnStudentAssignment[];
  skillOnCareers: SkillOnCareer[];
}
