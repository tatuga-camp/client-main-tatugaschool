export interface Subject {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  educationYear: Date;
  description: string;
  order: number;
  backgroundImage?: string;
  classId: string;
  userId: string;
  schoolId: string;
}
