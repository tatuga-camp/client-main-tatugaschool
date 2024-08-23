export interface FileOnStudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  type: string;
  url: string;
  size: number;
  subjectId: string;
  schoolId: string;
  studentOnAssignmentId: string;
}
