export interface StudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  photo: string;
  blurHash?: string | undefined;
  number: string;
  score: number;
  body: string;
  isAssigned: boolean;
  status: StudentAssignmentStatus;
  completedAt?: string;
  reviewdAt?: string;
  studentId: string;
  assignmentId: string;
  studentOnSubjectId: string;
  schoolId: string;
  subjectId: string;
}

export type StudentAssignmentStatus =
  | "PENDDING"
  | "SUBMITTED"
  | "REVIEWD"
  | "IMPROVED";
