import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssignmentOnQuiz } from "../interfaces";
import {
  CreateQuizQuestionService,
  DeleteQuizQuestionService,
  DuplicateQuizService,
  GetQuizMonitorService,
  GetQuizQuestionsService,
  GetQuizReviewService,
  OverrideQuizScoreService,
  ReorderQuizQuestionsService,
  ResetQuizAttemptService,
  UpdateQuizQuestionService,
} from "../services/quiz";
import { isQuizLockedError, reorderByIds } from "../utils/quizDraft";

export const keyQuiz = {
  questions: (assignmentId: string) =>
    ["quiz-questions", { assignmentId }] as const,
  monitor: (assignmentId: string) =>
    ["quiz-monitor", { assignmentId }] as const,
  review: (studentOnAssignmentId: string) =>
    ["quiz-review", { studentOnAssignmentId }] as const,
};

export function useGetQuizQuestions(input: { assignmentId: string }) {
  return useQuery({
    queryKey: keyQuiz.questions(input.assignmentId),
    queryFn: () => GetQuizQuestionsService(input),
  });
}

/** A 409 QUIZ_LOCKED means a student started meanwhile: refetch the monitor so the editor locks and shows the banner. */
function useLockRefresh() {
  const queryClient = useQueryClient();
  return (error: unknown) => {
    if (isQuizLockedError(error))
      queryClient.invalidateQueries({ queryKey: ["quiz-monitor"] });
  };
}

function useQuestionCache() {
  const queryClient = useQueryClient();
  return (
    assignmentId: string,
    update: (prev: AssignmentOnQuiz[]) => AssignmentOnQuiz[],
  ) => {
    queryClient.setQueryData(
      keyQuiz.questions(assignmentId),
      (prev: AssignmentOnQuiz[] | undefined) => update(prev ?? []),
    );
    // maxScore is recomputed server-side from question points.
    queryClient.invalidateQueries({
      queryKey: ["assignment", { id: assignmentId }],
    });
  };
}

export function useCreateQuizQuestion() {
  const setQuestions = useQuestionCache();
  const refreshLock = useLockRefresh();
  return useMutation({
    mutationKey: ["create-quiz-question"],
    onError: refreshLock,
    mutationFn: CreateQuizQuestionService,
    onSuccess: (data) =>
      setQuestions(data.assignmentId, (prev) => [...prev, data]),
  });
}

export function useUpdateQuizQuestion() {
  const setQuestions = useQuestionCache();
  const refreshLock = useLockRefresh();
  return useMutation({
    mutationKey: ["update-quiz-question"],
    onError: refreshLock,
    mutationFn: UpdateQuizQuestionService,
    onSuccess: (data) =>
      setQuestions(data.assignmentId, (prev) =>
        prev.map((q) => (q.id === data.id ? data : q)),
      ),
  });
}

export function useDeleteQuizQuestion() {
  const setQuestions = useQuestionCache();
  const refreshLock = useLockRefresh();
  return useMutation({
    mutationKey: ["delete-quiz-question"],
    onError: refreshLock,
    mutationFn: DeleteQuizQuestionService,
    onSuccess: (data) =>
      setQuestions(data.assignmentId, (prev) =>
        prev.filter((q) => q.id !== data.id),
      ),
  });
}

export function useReorderQuizQuestions() {
  const queryClient = useQueryClient();
  const refreshLock = useLockRefresh();
  return useMutation({
    mutationKey: ["reorder-quiz-questions"],
    mutationFn: ReorderQuizQuestionsService,
    // Optimistic: move the card now, roll back if the server refuses.
    onMutate: async (variables) => {
      const key = keyQuiz.questions(variables.assignmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AssignmentOnQuiz[]>(key);
      if (previous)
        queryClient.setQueryData(key, reorderByIds(previous, variables.ids));
      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          keyQuiz.questions(variables.assignmentId),
          context.previous,
        );
      refreshLock(error);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(keyQuiz.questions(variables.assignmentId), data);
    },
  });
}

export function useDuplicateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["duplicate-quiz"],
    mutationFn: DuplicateQuizService,
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: ["assignments", { subjectId: data.subjectId }],
      });
    },
  });
}

/** `poll` only on the visible Monitor tab; other readers (the lock check) fetch once. */
export function useGetQuizMonitor(input: {
  assignmentId: string;
  enabled: boolean;
  poll: boolean;
}) {
  return useQuery({
    queryKey: keyQuiz.monitor(input.assignmentId),
    queryFn: () => GetQuizMonitorService({ assignmentId: input.assignmentId }),
    enabled: input.enabled,
    refetchInterval: input.enabled && input.poll ? 10_000 : false,
  });
}

export function useGetQuizReview(input: {
  studentOnAssignmentId: string | null;
}) {
  return useQuery({
    queryKey: keyQuiz.review(input.studentOnAssignmentId ?? "none"),
    queryFn: () =>
      GetQuizReviewService({
        studentOnAssignmentId: input.studentOnAssignmentId as string,
      }),
    enabled: !!input.studentOnAssignmentId,
    refetchInterval: input.studentOnAssignmentId ? 10_000 : false,
  });
}

export function useOverrideQuizScore(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["override-quiz-score"],
    mutationFn: OverrideQuizScoreService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-review"] });
      queryClient.invalidateQueries({
        queryKey: keyQuiz.monitor(assignmentId),
      });
    },
  });
}

export function useResetQuizAttempt(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reset-quiz-attempt"],
    mutationFn: ResetQuizAttemptService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-review"] });
      queryClient.invalidateQueries({
        queryKey: keyQuiz.monitor(assignmentId),
      });
    },
  });
}
