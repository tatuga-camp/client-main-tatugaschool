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
  type: AttendanceType;
  expireAt?: string;
  allowScanAt?: string;
  isAllowScanManyTime?: boolean;
}
export type AttendanceType = "NORMAL" | "SCAN";
