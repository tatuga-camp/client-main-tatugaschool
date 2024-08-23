export interface Board {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  isCompleted: boolean;
  teamId: string;
  schoolId: string;
}
