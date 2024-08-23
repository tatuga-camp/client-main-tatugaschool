import { MemberOnTeam } from ".";

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
  schoolId: string;
  boardId: string;
  columId: string;
}
