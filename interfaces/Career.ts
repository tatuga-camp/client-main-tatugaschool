import { SkillOnCareer } from "./SkillOnCareer";

export interface Career {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  describe: string;
  keywords: string;
  vector: number[];
  skillOnCareers: SkillOnCareer[];
}
