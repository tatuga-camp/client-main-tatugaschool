export interface ScoreOnStudent {
  id: string;
  createAt: Date;
  updateAt: Date;
  score: number;
  title: string;
  icon: string;
  subjectId: string;

  scoreOnSubjectId: string;

  schoolId: string;

  studentId: string;

  studentOnSubjectId: string;
}
