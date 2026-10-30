import {
  useMutation,
  useQueryClient,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateFeedbackService,
  DeleteFeedbackService,
  GetFeedbacksService,
  GetMyFeedbackRewardService,
  RequestCreateFeedbackService,
  RequestGetFeedbacksService,
  ResponseCreateFeedbackService,
  ResponseFeedbackService,
  ResponseGetFeedbacksService,
} from "../services/feedback";

const FEEDBACK_REWARD_ME_KEY = ["feedback-reward", "me"];

export function useCreateFeedback(): UseMutationResult<
  ResponseCreateFeedbackService,
  Error,
  RequestCreateFeedbackService
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["feedback"],
    mutationFn: (input: RequestCreateFeedbackService) =>
      CreateFeedbackService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_REWARD_ME_KEY });
    },
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

export function useGetMyFeedbackReward(): UseQueryResult<
  { hasReward: boolean },
  Error
> {
  return useQuery({
    queryKey: FEEDBACK_REWARD_ME_KEY,
    queryFn: () => GetMyFeedbackRewardService(),
  });
}
