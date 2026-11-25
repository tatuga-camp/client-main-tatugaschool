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

export function useGetLineGroups(
  input: { subjectId: string },
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: keyLineGroup.getBySubjectId(input),
    queryFn: () => GetLineGroupsService(input),
    enabled: !!input.subjectId,
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchInterval ?? false,
  });
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
