export interface AttendanceRow {
  id: string;
  createAt: Date;
  updateAt: Date;
  startDate: Date;
  endDate: Date;
  note?: string;
  attendanceTableId: string;
  subjectId: string;
  schoolId: string;
}
