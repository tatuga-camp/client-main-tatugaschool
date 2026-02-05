import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateQuestionOnVideoService,
  DeleteQuestionOnVideoService,
  GetQuestionOnVideoByAssignmentIdService,
  RequestCreateQuestionOnVideoService,
  RequestDeleteQuestionOnVideoService,
  RequestGetQuestionOnVideoByAssignmentIdService,
  RequestUpdateQuestionOnVideoService,
  UpdateQuestionOnVideoService,
} from "../services/assignment-video-quiz";
import { QuestionOnVideo } from "../interfaces";

export const keyQuestionOnVideo = {
  getByAssignmentId: (request: { assignmentId: string }) => [
    "questionOnVideo",
    { assignmentId: request.assignmentId },
  ],
} as const;

export function useGetQuestionOnVideoByAssignmentId(
  request: RequestGetQuestionOnVideoByAssignmentIdService,
) {
  return useQuery({
    queryKey: keyQuestionOnVideo.getByAssignmentId(request),
    queryFn: () => GetQuestionOnVideoByAssignmentIdService(request),
  });
}

export function useCreateQuestionOnVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-question-on-video"],
    mutationFn: (request: RequestCreateQuestionOnVideoService) =>
      CreateQuestionOnVideoService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyQuestionOnVideo.getByAssignmentId({
          assignmentId: data.assignmentId,
        }),
        (prev: QuestionOnVideo[]): QuestionOnVideo[] => {
          return [...(prev ?? []), data];
        },
      );
    },
  });
}

export function useUpdateQuestionOnVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-question-on-video"],
    mutationFn: (request: RequestUpdateQuestionOnVideoService) =>
      UpdateQuestionOnVideoService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyQuestionOnVideo.getByAssignmentId({
          assignmentId: data.assignmentId,
        }),
        (prev: QuestionOnVideo[]): QuestionOnVideo[] => {
          return prev?.map((q) => (q.id === data.id ? data : q));
        },
      );
    },
  });
}

export function useDeleteQuestionOnVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-question-on-video"],
    mutationFn: (request: RequestDeleteQuestionOnVideoService) =>
      DeleteQuestionOnVideoService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyQuestionOnVideo.getByAssignmentId({
          assignmentId: data.assignmentId,
        }),
        (prev: QuestionOnVideo[]): QuestionOnVideo[] => {
          return prev?.filter((q) => q.id !== data.id);
        },
      );
    },
  });
}
