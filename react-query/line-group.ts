import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LineGroupOnSubject } from "../interfaces";
import {
  DisconnectLineGroupService,
  GetLineGroupsService,
  RequestDisconnectLineGroupService,
  RequestUpdateLineGroupService,
  UpdateLineGroupService,
} from "../services";

export const keyLineGroup = {
  getBySubjectId: (input: { subjectId: string }) => [
    "line-groups",
    { subjectId: input.subjectId },
  ],
  update: ["line-group-update"],
  disconnect: ["line-group-disconnect"],
} as const;

// The app-wide query defaults (pages/_app.tsx) turn window-focus refetching off
// and poll every 2 minutes. A code typed in LINE must show up when the teacher
// comes back to the tab, so focus always refetches here, even while the data is
// still fresh. `refetchInterval` only ever speeds polling up (15 s while a
// connect popup is open); without it the app default stays in force.
export function lineGroupsQueryOptions(
  input: { subjectId: string },
  options?: { refetchInterval?: number | false },
) {
  return {
    queryKey: keyLineGroup.getBySubjectId(input),
    queryFn: () => GetLineGroupsService(input),
    enabled: !!input.subjectId,
    refetchOnWindowFocus: "always" as const,
    ...(options?.refetchInterval
      ? { refetchInterval: options.refetchInterval }
      : {}),
  };
}

export function useGetLineGroups(
  input: { subjectId: string },
  options?: { refetchInterval?: number | false },
) {
  return useQuery(lineGroupsQueryOptions(input, options));
}

export function useUpdateLineGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyLineGroup.update,
    mutationFn: (input: RequestUpdateLineGroupService) =>
      UpdateLineGroupService(input),
    onSuccess(data) {
      queryClient.setQueryData(
        keyLineGroup.getBySubjectId({ subjectId: data.subjectId }),
        (prev: LineGroupOnSubject[] | undefined) =>
          prev?.map((link) => (link.id === data.id ? data : link)),
      );
    },
  });
}

export function useDisconnectLineGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyLineGroup.disconnect,
    mutationFn: (input: RequestDisconnectLineGroupService) =>
      DisconnectLineGroupService(input),
    onSuccess(data, variables) {
      queryClient.setQueryData(
        keyLineGroup.getBySubjectId({ subjectId: data.subjectId }),
        (prev: LineGroupOnSubject[] | undefined) =>
          prev?.filter((link) => link.id !== variables.id),
      );
    },
  });
}
