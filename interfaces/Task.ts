import { Board } from "./Board";
import { Colum } from "./Colum";
import { MemberOnTeam } from "./MemberOnTeam";
import { School } from "./School";
import { Team } from "./Team";

export interface Task {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  deadline?: Date;
  isCompleted: boolean;
  assigneeId?: string;
  assignee?: MemberOnTeam;
  teamId: string;
  team: Team;
  schoolId: string;
  school: School;
  boardId: string;
  board: Board;
  columId: string;
  colum: Colum;
}
