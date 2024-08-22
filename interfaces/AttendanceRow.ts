import { Attendance } from "./Attendance";
import { AttendanceTable } from "./AttendanceTable";
import { School } from "./School";
import { Subject } from "./Subject";

export interface AttendanceRow {
  id: string;
  createAt: Date;
  updateAt: Date;
  startDate: Date;
  endDate: Date;
  note?: string;
  attendanceTableId: string;
  attendanceTable: AttendanceTable;
  subjectId: string;
  subject: Subject;
  schoolId: string;
  school: School;
  attendances: Attendance[];
}
