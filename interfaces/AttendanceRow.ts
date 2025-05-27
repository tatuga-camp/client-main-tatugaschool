export interface AttendanceRow {
  id: string;
  createAt: string;
  updateAt: string;
  startDate: string;
  endDate: string;
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
