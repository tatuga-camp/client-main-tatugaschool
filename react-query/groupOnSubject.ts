import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateGroupOnSubjectService,
  DeleteeGroupOnSubjectService,
  GetGroupOnSubjectService,
  GetGroupOnSubjectsService,
  RequestCreateGroupOnSubjectService,
  RequestDeleteeGroupOnSubjectService,
  RequestUpdateGroupOnSubjectService,
  ResponseGetGroupOnSubjectService,
  ResponseGetGroupOnSubjectsService,
  UpdateGroupOnSubjectService,
} from "../services";

export const keyGroupOnSubject = {
  getBySubjectId: (input: { subjectId: string }) => [
    "groupOnSubjects",
    { subjectId: input.subjectId },
  ],
  getById: (input: { id: string }) => ["groupOnSubject", { id: input.id }],
  create: ["groupOnSubject-create"],
  update: ["groupOnSubject-update"],
  delete: ["groupOnSubject-delete"],
} as const;

export const keyUnitOnGroup = {
  create: ["unitOnGroup-create"],
  update: ["unitOnGroup-update"],
  delete: ["unitOnGroup-delete"],
  reorder: ["unitOnGroup-reorder"],
} as const;

export const keyStudentOnGroup = {
  create: ["studentOnGroup-create"],
  delete: ["studentOnGroup-delete"],
  reorder: ["studentOnGroup-reorder"],
} as const;

export function useGetGroupOnSubjects(request: { subjectId: string }) {
  return useQuery({
    queryKey: keyGroupOnSubject.getBySubjectId({
      subjectId: request.subjectId,
    }),
    queryFn: () => GetGroupOnSubjectsService(request),
  });
}

export function useGetGroupOnSubject(request: { id: string }) {
  return useQuery({
    queryKey: keyGroupOnSubject.getById({ id: request.id }),
    queryFn: () => GetGroupOnSubjectService({ groupOnSubjectId: request.id }),
  });
}

export function useCreateGroupOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyGroupOnSubject.create,
    mutationFn: (request: RequestCreateGroupOnSubjectService) =>
      CreateGroupOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.id }),
        (): ResponseGetGroupOnSubjectService => data
      );
      queryClient.setQueryData(
        keyGroupOnSubject.getBySubjectId({ subjectId: data.subjectId }),
        (
          prev: ResponseGetGroupOnSubjectsService
        ): ResponseGetGroupOnSubjectsService => {
          return [...prev, data];
        }
      );
    },
  });
}

export function useUpdateGroupOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyGroupOnSubject.update,
    mutationFn: (request: RequestUpdateGroupOnSubjectService) =>
      UpdateGroupOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getBySubjectId({ subjectId: data.subjectId }),
        (
          prev: ResponseGetGroupOnSubjectsService
        ): ResponseGetGroupOnSubjectsService => {
          return prev.map((group) => {
            if (group.id !== data.id) {
              return group;
            } else {
              return data;
            }
          });
        }
      );
    },
  });
}

export function useDeleteGroupOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyGroupOnSubject.delete,
    mutationFn: (request: RequestDeleteeGroupOnSubjectService) =>
      DeleteeGroupOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getBySubjectId({ subjectId: data.subjectId }),
        (
          prev: ResponseGetGroupOnSubjectsService
        ): ResponseGetGroupOnSubjectsService => {
          return prev.filter((g) => g.id !== data.id);
        }
      );
    },
  });
}
