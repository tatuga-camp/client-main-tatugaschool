import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { CreateFeedbackService, RequestCreateFeedbackService, ResponseFeedbackService } from "../services/feedback";

export function useCreateFeedback(): UseMutationResult<ResponseFeedbackService, Error, RequestCreateFeedbackService> {
  return useMutation({
    mutationKey: ["feedback"],
    mutationFn: (input: RequestCreateFeedbackService) => CreateFeedbackService(input),
    onSuccess(data, _variables, _context) {
      console.log("Feedback submitted successfully:", data);
    },
    onError(error) {
      console.error("Error submitting feedback:", error);
    },
  });
}
