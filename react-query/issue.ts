import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { IssueGroup } from "../interfaces";
import {
  GetIssueService,
  GetIssuesService,
  RequestGetIssueService,
  RequestGetIssuesService,
  RequestUpdateIssueStatusService,
  ResponseGetIssueService,
  ResponseGetIssuesService,
  UpdateIssueStatusService,
} from "../services/issue";

export function useGetIssues(
  query: RequestGetIssuesService,
): UseQueryResult<ResponseGetIssuesService, Error> {
  return useQuery({
    queryKey: ["issues", query],
    queryFn: () => GetIssuesService(query),
    placeholderData: (previous) => previous,
  });
}

export function useGetIssue(
  input: RequestGetIssueService,
): UseQueryResult<ResponseGetIssueService, Error> {
  return useQuery({
    queryKey: ["issue", input],
    queryFn: () => GetIssueService(input),
    enabled: Boolean(input.groupId),
    placeholderData: (previous) => previous,
  });
}

export function useUpdateIssueStatus(): UseMutationResult<
  IssueGroup,
  Error,
  RequestUpdateIssueStatusService
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateIssueStatus"],
    mutationFn: (input) => UpdateIssueStatusService(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({
        queryKey: ["issue"],
        predicate: (q) =>
          (q.queryKey[1] as { groupId?: string } | undefined)?.groupId ===
          variables.groupId,
      });
    },
  });
}
