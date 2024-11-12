export interface AttendanceTable {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  subjectId: string;
  schoolId: string;
}
export type AttendanceStatusList = {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  value: number;
  color: string;
  attendanceTableId: string;
  schoolId: string;
  subjectId: string;
};
