import { Attendance } from "./Attendance";
import { Class } from "./Class";
import { CommentOnAssignmentStudent } from "./CommentOnAssignmentStudent";
import { School } from "./School";
import { ScoreOnStudent } from "./ScoreOnStudent";
import { StudentOnAssignment } from "./StudentOnAssignment";
import { StudentOnSubject } from "./StudentOnSubject";

export interface Student {
    id: string;
    createAt: Date;
    updateAt: Date;
    title: string;
    firstName: string;
    lastName: string;
    picture: string;
    number: string;
    schoolId: string;
    classId: string;
    school: School;
    class: Class;
    studentOnSubjects: StudentOnSubject[];
    studentOnAssignments: StudentOnAssignment[];
    commentOnAssignmentStudents: CommentOnAssignmentStudent[];
    scoreOnStudents: ScoreOnStudent[];
    attendances: Attendance[];
}
