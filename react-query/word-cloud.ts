import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateWordCloudService,
  DeleteWordCloudService,
  GetWordCloudByIdService,
  GetWordCloudsBySubjectService,
  RequestCreateWordCloudService,
  RequestDeleteWordCloudService,
  RequestUpdateWordCloudService,
  UpdateWordCloudService,
} from "../services";

export function useGetWordCloudsBySubject({ subjectId }: { subjectId: string }) {
  return useQuery({
    queryKey: ["word-clouds", { subjectId }],
    queryFn: () => GetWordCloudsBySubjectService({ subjectId }),
  });
}

export function useGetWordCloudById({
  wordCloudId,
  refetchInterval = false,
}: {
  wordCloudId: string;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: ["word-cloud", { wordCloudId }],
    queryFn: () => GetWordCloudByIdService({ wordCloudId }),
    refetchInterval,
    enabled: !!wordCloudId,
  });
}

export function useCreateWordCloud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-word-cloud"],
    mutationFn: (request: RequestCreateWordCloudService) =>
      CreateWordCloudService(request),
    onSuccess(data) {
      queryClient.setQueryData(
        ["word-clouds", { subjectId: data.subjectId }],
        (old: any) => [data, ...(old ?? [])],
      );
    },
  });
}

export function useUpdateWordCloud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-word-cloud"],
    mutationFn: (request: RequestUpdateWordCloudService) =>
      UpdateWordCloudService(request),
    onSuccess(data) {
      queryClient.setQueryData(
        ["word-clouds", { subjectId: data.subjectId }],
        (old: any) =>
          (old ?? []).map((w: any) => (w.id === data.id ? data : w)),
      );
      queryClient.setQueryData(["word-cloud", { wordCloudId: data.id }], (old: any) =>
        old ? { ...old, wordCloud: data } : old,
      );
    },
  });
}

export function useDeleteWordCloud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-word-cloud"],
    mutationFn: (request: RequestDeleteWordCloudService) =>
      DeleteWordCloudService(request),
    onSuccess(data) {
      queryClient.setQueryData(
        ["word-clouds", { subjectId: data.subjectId }],
        (old: any) => (old ?? []).filter((w: any) => w.id !== data.id),
      );
    },
  });
}
