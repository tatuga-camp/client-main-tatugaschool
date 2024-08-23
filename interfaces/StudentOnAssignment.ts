export interface StudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  picture: string;
  number: string;
  score: number;
  body: string;
  isCompleted: boolean;
  isReviewed: boolean;
  studentId: string;
  assignmentId: string;
  studentOnSubjectId: string;
  schoolId: string;
  subjectId: string;
}
