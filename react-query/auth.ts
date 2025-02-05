import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestResetPasswordService, ResetPasswordService } from "../services";

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reset-password"],
    mutationFn: (input: RequestResetPasswordService) =>
      ResetPasswordService(input),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries();
    },
  });
}
