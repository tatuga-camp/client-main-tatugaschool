export type Grade = {
  id: string;
  createAt: Date;
  updateAt: Date;
  gradeRules: GradeRule[];
  subjectId: string;
  schoolId: string;
};
export type GradeRule = { max: number; min: number; grade: string };
