import { Attendance } from "./Attendance";
import { AttendanceRow } from "./AttendanceRow";
import { School } from "./School";
import { Subject } from "./Subject";

export interface AttendanceTable {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  subjectId: string;
  subject: Subject;
  schoolId: string;
  school: School;
  attendances: Attendance[];
  attendanceRows: AttendanceRow[];
}
