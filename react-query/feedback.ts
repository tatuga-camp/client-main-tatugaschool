import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateFeedbackService,
  DeleteFeedbackService,
  GetFeedbacksService,
  RequestCreateFeedbackService,
  RequestGetFeedbacksService,
  ResponseFeedbackService,
  ResponseGetFeedbacksService,
} from "../services/feedback";

export function useCreateFeedback(): UseMutationResult<
  ResponseFeedbackService,
  Error,
  RequestCreateFeedbackService
> {
  return useMutation({
    mutationKey: ["feedback"],
    mutationFn: (input: RequestCreateFeedbackService) =>
      CreateFeedbackService(input),
  });
}

export function useGetFeedbacks(
  query: RequestGetFeedbacksService,
): UseQueryResult<ResponseGetFeedbacksService, Error> {
  return useQuery({
    queryKey: ["feedbacks", query],
    queryFn: () => GetFeedbacksService(query),
  });
}

export function useDeleteFeedback(): UseMutationResult<
  ResponseFeedbackService,
  Error,
  { feedbackId: string }
> {
  return useMutation({
    mutationKey: ["deleteFeedback"],
    mutationFn: ({ feedbackId }) => DeleteFeedbackService(feedbackId),
  });
}
