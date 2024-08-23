export interface Assignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  beginDate: Date;
  dueDate: Date;
  subjectId: string;
  schoolId: string;
}
