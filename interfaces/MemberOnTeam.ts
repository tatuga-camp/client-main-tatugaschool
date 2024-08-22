import { Status, MemberRole, MemberOnSchool } from "./MemberOnSchool";
import { School } from "./School";
import { Task } from "./Task";
import { Team } from "./Team";
import { User } from "./user";

export interface MemberOnTeam {
    id: string;
    createAt: Date;
    updateAt: Date;
    status: Status;
    role: MemberRole;
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    phone: string;
    userId: string;
    memberOnSchoolId: string;
    teamId: string;
    schoolId: string;
    user: User;
    memberOnSchool: MemberOnSchool;
    team: Team;
    school: School;
    Task: Task[];
}
