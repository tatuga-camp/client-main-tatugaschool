export interface Classroom {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  level: string;
  description?: string;
  isAchieved: boolean;
  order: number | undefined;
  userId: string | undefined | null;
  schoolId: string;
}
