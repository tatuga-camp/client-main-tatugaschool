import { Plan } from "./School";

export type TeachingMaterial = {
  description: string;
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  tags: string[];
  accessLevel: Plan;
  vector: number[];
};
