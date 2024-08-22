import { Career } from "./Career";
import { Skill } from "./Skill";

export interface SkillOnCareer {
  id: string;
  createAt: Date;
  updateAt: Date;
  weight: number;
  skillId: string;
  skill: Skill;
  careerId: string;
  career: Career;
}
