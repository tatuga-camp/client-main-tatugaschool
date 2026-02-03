import { Language } from "./User";

export type VideoQuestion = {
  id: string;
  timestamp: number; // in seconds
  question: string;
  options: string[];
  correctOption: number; // index of the correct option
};

export type VideoConfig = {
  preventFastForward: boolean;
  questions: VideoQuestion[];
  language?: Language;
};
