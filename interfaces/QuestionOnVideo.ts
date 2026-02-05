export type QuestionOnVideo = {
  id: string;
  createAt: string;
  updateAt: string;
  question: string;
  options: string[];
  correctOptions: number[];
  timestamp: number;
  assignmentId: string;
  subjectId: string;
};
