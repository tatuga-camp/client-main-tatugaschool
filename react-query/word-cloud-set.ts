import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AppendWordCloudQuestionService,
  CreateWordCloudSetService,
  DeleteWordCloudSetService,
  GetWordCloudSetByIdService,
  GetWordCloudSetsBySubjectService,
  RequestAppendQuestion,
  RequestCreateWordCloudSet,
  RequestDeleteWordCloudSet,
  RequestUpdateWordCloudSet,
  UpdateWordCloudSetService,
} from "../services";

export function useGetWordCloudSetsBySubject({
  subjectId,
}: {
  subjectId: string;
}) {
  return useQuery({
    queryKey: ["word-cloud-sets", { subjectId }],
    queryFn: () => GetWordCloudSetsBySubjectService({ subjectId }),
  });
}

export function useGetWordCloudSetById({
  setId,
  refetchInterval = false,
}: {
  setId: string;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: ["word-cloud-set", { setId }],
    queryFn: () => GetWordCloudSetByIdService({ setId }),
    refetchInterval,
    enabled: !!setId,
  });
}

export function useCreateWordCloudSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-word-cloud-set"],
    mutationFn: (request: RequestCreateWordCloudSet) =>
      CreateWordCloudSetService(request),
    onSuccess(data) {
      queryClient.setQueryData(
        ["word-cloud-sets", { subjectId: data.subjectId }],
        (old: any) => [data, ...(old ?? [])],
      );
    },
  });
}

export function useUpdateWordCloudSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-word-cloud-set"],
    mutationFn: (request: RequestUpdateWordCloudSet) =>
      UpdateWordCloudSetService(request),
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["word-cloud-set", { setId: data.id }],
      });
      queryClient.setQueryData(
        ["word-cloud-sets", { subjectId: data.subjectId }],
        (old: any) =>
          (old ?? []).map((s: any) => (s.id === data.id ? data : s)),
      );
    },
  });
}

export function useAppendWordCloudQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["append-word-cloud-question"],
    mutationFn: (request: RequestAppendQuestion) =>
      AppendWordCloudQuestionService(request),
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["word-cloud-set", { setId: variables.setId }],
      });
    },
  });
}

export function useDeleteWordCloudSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-word-cloud-set"],
    mutationFn: (request: RequestDeleteWordCloudSet) =>
      DeleteWordCloudSetService(request),
    onSuccess(data) {
      queryClient.setQueryData(
        ["word-cloud-sets", { subjectId: data.subjectId }],
        (old: any) => (old ?? []).filter((s: any) => s.id !== data.id),
      );
    },
  });
}
