export type GroupOnSubject = {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string | null;
  subjectId: string;
  schoolId: string;
};

export type UnitOnGroup = {
  id: string;
  createAt: Date;
  updateAt: Date;
  icon: string;
  title: string;
  description: string | null;
  totalScore: number;
  order: number | null;
  groupOnSubjectId: string;
  subjectId: string;
  schoolId: string;
};

export type StudentOnGroup = {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  photo: string;
  blurHash: string | null;
  number: string;
  order: number | null;
  unitOnGroupId: string;
  unitOnGroup: UnitOnGroup;
  studentId: string;
  studentOnSubjectId: string;

  groupOnSubjectId: string;
  subjectId: string;

  schoolId: string;
};
