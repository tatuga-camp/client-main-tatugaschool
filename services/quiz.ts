import {
  Assignment,
  AssignmentOnQuiz,
  QuizGenerationInput,
  QuizGenerationJob,
  QuizGenerationView,
  QuizMonitorView,
  QuizQuestionInput,
  QuizReviewView,
  StudentOnAssignment,
} from "../interfaces";
import type { AxiosRequestConfig } from "axios";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

async function call<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance(config);
    return response.data as T;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export function GetQuizQuestionsService(input: { assignmentId: string }) {
  return call<AssignmentOnQuiz[]>({
    method: "GET",
    url: `/v1/quiz/assignment/${input.assignmentId}/questions`,
  });
}

export function CreateQuizQuestionService(
  input: QuizQuestionInput & { assignmentId: string },
) {
  return call<AssignmentOnQuiz>({
    method: "POST",
    url: `/v1/quiz/questions`,
    data: input,
  });
}

export function UpdateQuizQuestionService(input: {
  id: string;
  data: Partial<QuizQuestionInput>;
}) {
  return call<AssignmentOnQuiz>({
    method: "PATCH",
    url: `/v1/quiz/questions/${input.id}`,
    data: input.data,
  });
}

export function DeleteQuizQuestionService(input: { id: string }) {
  return call<AssignmentOnQuiz>({
    method: "DELETE",
    url: `/v1/quiz/questions/${input.id}`,
  });
}

export function ReorderQuizQuestionsService(input: {
  assignmentId: string;
  ids: string[];
}) {
  return call<AssignmentOnQuiz[]>({
    method: "PATCH",
    url: `/v1/quiz/assignment/${input.assignmentId}/reorder`,
    data: { ids: input.ids },
  });
}

export function DuplicateQuizService(input: {
  assignmentId: string;
  targetSubjectId?: string;
}) {
  return call<Assignment>({
    method: "POST",
    url: `/v1/quiz/assignment/${input.assignmentId}/duplicate`,
    data: input.targetSubjectId
      ? { targetSubjectId: input.targetSubjectId }
      : {},
  });
}

export function GetQuizMonitorService(input: { assignmentId: string }) {
  return call<QuizMonitorView>({
    method: "GET",
    url: `/v1/quiz/assignment/${input.assignmentId}/monitor`,
  });
}

export function GetQuizReviewService(input: { studentOnAssignmentId: string }) {
  return call<QuizReviewView>({
    method: "GET",
    url: `/v1/quiz/student-on-assignment/${input.studentOnAssignmentId}/review`,
  });
}

export function OverrideQuizScoreService(input: {
  studentOnQuizId: string;
  score: number;
}) {
  return call<{ studentOnQuizId: string; score: number; total: number }>({
    method: "PATCH",
    url: `/v1/quiz/student-on-quiz/${input.studentOnQuizId}/score`,
    data: { score: input.score },
  });
}

export function ResetQuizAttemptService(input: {
  studentOnAssignmentId: string;
}) {
  return call<StudentOnAssignment>({
    method: "POST",
    url: `/v1/quiz/student-on-assignment/${input.studentOnAssignmentId}/reset`,
  });
}

// --- AI generation ---

/** Newest generation job for the quiz (any status) plus this month's usage. */
export function GetQuizGenerationService(input: { assignmentId: string }) {
  return call<QuizGenerationView>({
    method: "GET",
    url: `/v1/quiz/assignment/${input.assignmentId}/generation`,
  });
}

/** Queues a generation job. Errors: 409 QUIZ_LOCKED | QUIZ_NOT_DRAFT | QUIZ_GENERATING, 403 AI_QUOTA_EXCEEDED, 503 AI_GENERATION_UNAVAILABLE, 502 AI_GENERATION_PUBLISH_FAILED. */
export function CreateQuizGenerationService(input: {
  assignmentId: string;
  data: QuizGenerationInput;
}) {
  return call<QuizGenerationJob>({
    method: "POST",
    url: `/v1/quiz/assignment/${input.assignmentId}/generation`,
    data: input.data,
  });
}
