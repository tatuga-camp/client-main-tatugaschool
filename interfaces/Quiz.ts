export type QuizScoringMode = "ALL_OR_NOTHING" | "PARTIAL";
export type QuizQuestionType = "SINGLE" | "MULTIPLE" | "FILL_BLANK";
export type QuizRiskSource = "RULE" | "JEV";
export type QuizRiskPattern =
  | "NORMAL"
  | "CONNECTIVITY"
  | "DISTRACTED"
  | "OUTSIDE_HELP";
export type QuizMonitorStatus =
  | "NOT_STARTED"
  | "ANSWERING"
  | "AWAY"
  | "SUBMITTED";
export type QuizIntegrityEventType =
  | "HIDDEN"
  | "VISIBLE"
  | "BLUR"
  | "FOCUS"
  | "TRANSLATE_DETECTED"
  | "COPY_ATTEMPT"
  | "PASTE_ATTEMPT"
  | "FULLSCREEN_EXIT"
  | "SCREENSHOT_KEY"
  | "HEARTBEAT_GAP"
  | "PAGE_HIDE"
  | "PAGE_SHOW";

export type QuizSettings = {
  scoringMode: QuizScoringMode;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  testMode: boolean;
  showAnswersAfterSubmit: boolean;
};

export type QuizOption = {
  id: string;
  text: string;
  imageUrl: string | null;
  isCorrect: boolean;
};
export type QuizBlank = { id: string; acceptedAnswers: string[] };

export type AssignmentOnQuiz = {
  id: string;
  createAt: string;
  updateAt: string;
  order: number;
  type: QuizQuestionType;
  prompt: string;
  imageUrl: string | null;
  points: number;
  options: QuizOption[];
  blanks: QuizBlank[];
  assignmentId: string;
  subjectId: string;
  schoolId: string;
};

export type QuizQuestionInput = {
  type: QuizQuestionType;
  prompt: string;
  imageUrl?: string | null;
  points: number;
  options: {
    id: string;
    text: string;
    imageUrl?: string | null;
    isCorrect: boolean;
  }[];
  blanks: QuizBlank[];
};

export type QuizIntegritySummary = {
  exitCount: number;
  totalAwayMs: number;
  longestAwayMs: number;
  blurCount: number;
  translateDetected: boolean;
  pasteAttempts: number;
  copyAttempts: number;
  fullscreenExits: number;
  screenshotKeyCount: number;
  heartbeatGapCount: number;
  longestHeartbeatGapMs: number;
};

export type QuizAttempt = {
  startedAt: string;
  deadlineAt: string | null;
  submittedAt: string | null;
  lastSeenAt: string;
  shuffleSeed: number;
  integritySummary: QuizIntegritySummary;
  riskScore: number | null;
  riskSource: QuizRiskSource | null;
  riskPattern: QuizRiskPattern | null;
  riskConfidence: number | null;
  riskCheckedAt: string | null;
};

export type StudentOnQuiz = {
  id: string;
  selectedOptionIds: string[];
  blankAnswers: { blankId: string; value: string }[];
  score: number | null;
  teacherOverridden: boolean;
  assignmentOnQuizId: string;
  studentOnAssignmentId: string;
};

export type QuizMonitorRow = {
  studentOnAssignmentId: string;
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  number: string;
  photo: string;
  blurHash: string | null;
  status: QuizMonitorStatus;
  answeredCount: number;
  questionCount: number;
  startedAt: string | null;
  submittedAt: string | null;
  lastSeenAt: string | null;
  score: number | null;
  integritySummary: QuizIntegritySummary | null;
  riskScore: number | null;
  riskSource: QuizRiskSource | null;
  riskPattern: QuizRiskPattern | null;
  riskConfidence: number | null;
};

export type QuizMonitorView = {
  assignmentId: string;
  testMode: boolean;
  questionCount: number;
  /** True when any student has started an attempt (server-side, includes unassigned students). */
  locked: boolean;
  serverNow: string;
  rows: QuizMonitorRow[];
};

export type QuizReviewEvent = {
  id: string;
  type: QuizIntegrityEventType;
  serverAt: string;
  clientAt: string;
  durationMs: number | null;
};

export type QuizReviewView = {
  studentOnAssignment: {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    number: string;
    photo: string;
    score: number | null;
    status: string;
    quizAttempt: QuizAttempt | null;
  };
  maxScore: number | null;
  scoringMode: QuizScoringMode;
  testMode: boolean;
  items: { question: AssignmentOnQuiz; answer: StudentOnQuiz | null }[];
  events: QuizReviewEvent[];
};
