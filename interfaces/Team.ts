import { Board } from "./Board";
import { Colum } from "./Colum";
import { MemberOnTeam } from "./MemberOnTeam";
import { School } from "./School";
import { Task } from "./Task";

export interface Team {
    id: string;
    createAt: Date;
    updateAt: Date;
    title: string;
    description?: string;
    icon: string;
    schoolId: string;
    school: School;
    memberOnTeams: MemberOnTeam[];
    Board: Board[];
    Colum: Colum[];
    Task: Task[];
}
