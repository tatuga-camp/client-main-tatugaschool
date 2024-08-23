export interface AttendanceTable {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  subjectId: string;

  schoolId: string;
}
