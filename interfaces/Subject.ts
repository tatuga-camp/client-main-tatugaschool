export interface Subject {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  educationYear: string;
  description: string;
  order: number;
  backgroundImage?: string;
  blurHash?: string;
  classId: string;
  userId: string;
  schoolId: string;
  code: string;
  wheelOfNamePath?: string | null;
  allowStudentDeleteWork: boolean;
  allowStudentViewOverallScore: boolean;
  allowStudentViewGrade: boolean;
  allowStudentViewAttendance: boolean;
  isLocked: boolean;
}

export type EducationYear = `${string}/${string}`;
