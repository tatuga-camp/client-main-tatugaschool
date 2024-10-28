export interface Subject {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  educationYear: Date;
  description: string;
  order: number;
  backgroundImage?: string;
  blurHash?: string;
  classId: string;
  userId: string;
  schoolId: string;
}
