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
  studentId: string;
  attendanceRowId: string;
  studentOnSubjectId: string;
  schoolId: string;
  subjectId: string;
}
