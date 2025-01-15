export interface Student {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  photo: string;
  blurHash?: string | undefined;
  number: string;
  schoolId: string;
  classId: string;
}
