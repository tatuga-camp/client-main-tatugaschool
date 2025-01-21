import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateCommentTeacherService,
  DeleteCommentTeacherService,
  GetCommentTeacherService,
  RequestCreateCommentTeacher,
  RequestDeleteCommentService,
  RequestUpdateCommentService,
  ResponseGetCommentService,
  UpdateCommentTeacherService,
} from "../services/comment-assignment";

export function useGetComments(input: { studentOnAssignmentId: string }) {
  return useQuery({
    queryKey: [
      "comment-assignments",
      { studentOnAssignmentId: input.studentOnAssignmentId },
    ],
    queryFn: () =>
      GetCommentTeacherService({
        studentOnAssignmentId: input.studentOnAssignmentId,
      }),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-comment"],
    mutationFn: (input: RequestCreateCommentTeacher) =>
      CreateCommentTeacherService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "comment-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (oldData: ResponseGetCommentService) => {
          return [...oldData, data];
        }
      );
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-comment"],
    mutationFn: (input: RequestUpdateCommentService) =>
      UpdateCommentTeacherService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "comment-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (oldData: ResponseGetCommentService) => {
          return oldData.map((comment) =>
            comment.id === data.id ? data : comment
          );
        }
      );
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-comment"],
    mutationFn: (input: RequestDeleteCommentService) =>
      DeleteCommentTeacherService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "comment-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (oldData: ResponseGetCommentService) => {
          return oldData.filter((comment) => comment.id !== data.id);
        }
      );
    },
  });
}
