export interface Class {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  level: string;
  description?: string;
  educationYear: string;
  isAchieved: boolean;
  order: number;
  schoolId: string;
}
