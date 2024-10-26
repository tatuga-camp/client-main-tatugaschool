export interface ScoreOnSubject {
  id: string;
  createAt: Date;
  updateAt: Date;
  score: number;
  title: string;
  icon: string;
  isDeleted: boolean;
  schoolId: string;
  blurHash: string;
  subjectId: string;
}
