import { Colum } from "./Colum";
import { School } from "./School";
import { Task } from "./Task";
import { Team } from "./Team";

export interface Board {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  isCompleted: boolean;
  teamId: string;
  team: Team;
  schoolId: string;
  school: School;
  colums: Colum[];
  Task: Task[];
}
