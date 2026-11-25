import {
  QueryClient,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

// A list fetch that was already in flight when a switch is flipped or a group
// is disconnected answers with the list as it was before the change, and would
// overwrite the fresh cache. So both mutations cancel in-flight list fetches
// before the request and again before writing the cache, then invalidate the
// list once settled so it is read again from the server.
//
// The request carries only the link id, so before the request the subject is
// found by looking for the cached lists that hold that link.
function listKeysHoldingLink(queryClient: QueryClient, id: string): QueryKey[] {
  return queryClient
    .getQueriesData<LineGroupOnSubject[]>({ queryKey: ["line-groups"] })
    .filter(
      ([, links]) =>
        Array.isArray(links) && links.some((link) => link.id === id),
    )
    .map(([queryKey]) => queryKey);
}

async function cancelListsHoldingLink(queryClient: QueryClient, id: string) {
  const listKeys = listKeysHoldingLink(queryClient, id);
  await Promise.all(
    listKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })),
  );
  return { listKeys };
}

function invalidateLists(
  queryClient: QueryClient,
  data: LineGroupOnSubject | undefined,
  context: { listKeys: QueryKey[] } | undefined,
) {
  const keys: QueryKey[] = [...(context?.listKeys ?? [])];
  if (data) {
    keys.push(keyLineGroup.getBySubjectId({ subjectId: data.subjectId }));
  }
  const seen = new Set<string>();
  return Promise.all(
    keys
      .filter((queryKey) => {
        const hash = JSON.stringify(queryKey);
        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
      })
      .map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

export function useUpdateLineGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyLineGroup.update,
    mutationFn: (input: RequestUpdateLineGroupService) =>
      UpdateLineGroupService(input),
    onMutate: (variables) => cancelListsHoldingLink(queryClient, variables.id),
    async onSuccess(data) {
      const queryKey = keyLineGroup.getBySubjectId({
        subjectId: data.subjectId,
      });
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(
        queryKey,
        (prev: LineGroupOnSubject[] | undefined) =>
          prev?.map((link) => (link.id === data.id ? data : link)),
      );
    },
    onSettled: (data, _error, _variables, context) =>
      invalidateLists(queryClient, data, context),
  });
}

export function useDisconnectLineGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyLineGroup.disconnect,
    mutationFn: (input: RequestDisconnectLineGroupService) =>
      DisconnectLineGroupService(input),
    onMutate: (variables) => cancelListsHoldingLink(queryClient, variables.id),
    async onSuccess(data, variables) {
      const queryKey = keyLineGroup.getBySubjectId({
        subjectId: data.subjectId,
      });
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(
        queryKey,
        (prev: LineGroupOnSubject[] | undefined) =>
          prev?.filter((link) => link.id !== variables.id),
      );
    },
    onSettled: (data, _error, _variables, context) =>
      invalidateLists(queryClient, data, context),
  });
}
