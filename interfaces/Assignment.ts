export interface Assignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  maxScore: number;
  weight: number | null;
  beginDate: string;
  dueDate?: string;
  subjectId: string;
  order: number;
  schoolId: string;
  status: AssignmentStatus;
  type: AssignmentType;
}

export type AssignmentStatus = "Published" | "Draft";
export type AssignmentType = "Assignment" | "Material";
