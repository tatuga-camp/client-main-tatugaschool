export interface Team {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  icon: string;
  schoolId: string;
}
