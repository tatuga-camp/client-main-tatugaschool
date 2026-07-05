export type WordCloudStatus = "OPEN" | "CLOSED";
export type WordCloudAccess = "PUBLIC" | "STUDENTS_ONLY";

export interface WordCloud {
  id: string;
  createAt: string;
  updateAt: string;
  question: string;
  status: WordCloudStatus;
  accessMode: WordCloudAccess;
  allowMultiple: boolean;
  subjectId: string;
  schoolId: string;
  userId: string;
}

export interface WordCount {
  text: string;
  normalized: string;
  count: number;
  students?: string[]; // names of answerers, only for STUDENTS_ONLY clouds
}

export interface WordCloudDetail {
  wordCloud: WordCloud;
  words: WordCount[];
  totalAnswers: number;
}

export interface WordCloudSet {
  id: string;
  createAt: string;
  updateAt: string;
  title?: string | null;
  status: WordCloudStatus;
  accessMode: WordCloudAccess;
  allowMultiple: boolean;
  activeWordCloudId: string | null;
  publicResultsToken?: string | null;
  subjectId: string;
  schoolId: string;
  userId: string;
}

export interface SetQuestionResult {
  wordCloud: WordCloud;
  words: WordCount[];
  totalAnswers: number;
}

export interface WordCloudSetDetail {
  set: WordCloudSet;
  questions: SetQuestionResult[];
}
