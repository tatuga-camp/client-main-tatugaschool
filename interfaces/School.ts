import { Assignment } from "./Assignment";
import { Attendance } from "./Attendance";
import { AttendanceRow } from "./AttendanceRow";
import { AttendanceTable } from "./AttendanceTable";
import { Board } from "./Board";
import { Class } from "./Class";
import { Colum } from "./Colum";
import { CommentOnAssignmentStudent } from "./CommentOnAssignmentStudent";
import { CommentOnAssignmentTeacher } from "./CommentOnAssignmentTeacher";
import { FileOnAssignment } from "./FileOnAssignment";
import { FileOnStudentOnAssignment } from "./FileOnStudentOnAssignment";
import { MemberOnSchool } from "./MemberOnSchool";
import { MemberOnTeam } from "./MemberOnTeam";
import { ScoreOnStudent } from "./ScoreOnStudent";
import { ScoreOnSubject } from "./ScoreOnSubject";
import { Student } from "./Student";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { StudentOnSubject } from "./StudentOnSubject";
import { Subject } from "./Subject";
import { Task } from "./Task";
import { TeacherOnSubject } from "./TeacherOnSubject";
import { Team } from "./Team";
import { User } from "./user";

export interface School {
    id: string;
    createAt: Date;
    updateAt: Date;
    title: string;
    description: string;
    plan: Plan;
    isDeleted: boolean;
    stripe_customer_id: string;
    stripe_price_id?: string;
    stripe_subscription_id?: string;
    stripe_subscription_expireAt?: Date;
    billingManagerId?: string;
    billingManager?: User;
    memberOnSchools: MemberOnSchool[];
    classes: Class[];
    teams: Team[];
    students: Student[];
    subjects: Subject[];
    memberOnTeams: MemberOnTeam[];
    assignments: Assignment[];
    studentOnAssignments: StudentOnAssignment[];
    attendanceRows: AttendanceRow[];
    attendances: Attendance[];
    teacherOnSubjects: TeacherOnSubject[];
    attendanceTables: AttendanceTable[];
    commentOnAssignmentTeachers: CommentOnAssignmentTeacher[];
    commentOnAssignmentStudents: CommentOnAssignmentStudent[];
    scoreOnStudents: ScoreOnStudent[];
    scoreOnSubjects: ScoreOnSubject[];
    fileOnStudentOnAssignments: FileOnStudentOnAssignment[];
    fileOnAssignments: FileOnAssignment[];
    studentOnSubjects: StudentOnSubject[];
    Board: Board[];
    Colum: Colum[];
    Task: Task[];
}

export enum Plan {
    FREE,
    PREMIUM
}
