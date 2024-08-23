export interface Class {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  level: string;
  description?: string;
  educationYear: Date;
  order: number;
  schoolId: string;
}
