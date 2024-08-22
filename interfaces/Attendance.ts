import { AttendanceRow } from "./AttendanceRow";
import { AttendanceTable } from "./AttendanceTable";
import { School } from "./School";
import { Student } from "./Student";
import { StudentOnSubject } from "./StudentOnSubject";
import { Subject } from "./Subject";

export interface Attendance {
  id: string;
  createAt: Date;
  updateAt: Date;
  startDate: Date;
  endDate: Date;
  absent: boolean;
  present: boolean;
  holiday: boolean;
  sick: boolean;
  late: boolean;
  note?: string;
  attendanceTableId: string;
  attendanceTable: AttendanceTable;
  studentId: string;
  student: Student;
  attendanceRowId: string;
  attendanceRow: AttendanceRow;
  studentOnSubjectId: string;
  studentOnSubject: StudentOnSubject;
  schoolId: string;
  school: School;
  subjectId: string;
  subject: Subject;
}
