import { Board } from "./Board";
import { School } from "./School";
import { Task } from "./Task";
import { Team } from "./Team";

export interface Colum {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  color: string;
  teamId: string;
  team: Team;
  schoolId: string;
  school: School;
  boardId: string;
  board: Board;
  tasks: Task[];
}
