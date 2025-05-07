import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateGroupOnSubjectService,
  CreateStudentOnGroupService,
  CreateUnitOnGroupService,
  DeleteeGroupOnSubjectService,
  DeleteStudentOnGroupService,
  DeleteUnitOnGroupService,
  GetGroupOnSubjectService,
  GetGroupOnSubjectsService,
  RefetchGroupOnSubjectService,
  ReorderStudentOnGroupService,
  ReorderUnitOnGroupService,
  RequestCreateGroupOnSubjectService,
  RequestCreateStudentOnGroupService,
  RequestCreateUnitOnGroupService,
  RequestDeleteeGroupOnSubjectService,
  RequestDeleteStudentOnGroupService,
  RequestDeleteUnitOnGroupService,
  RequestRefetchGroupOnSubjectService,
  RequestReorderStudentOnGroupService,
  RequestReorderUnitOnGroupService,
  RequestUpdateGroupOnSubjectService,
  RequestUpdateStudentOnGroupService,
  RequestUpdateUnitOnGroupService,
  ResponseGetGroupOnSubjectService,
  ResponseGetGroupOnSubjectsService,
  UpdateGroupOnSubjectService,
  UpdateStudentOnGroupService,
  UpdateUnitOnGroupService,
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
  refetch: ["groupOnSubject-refetch"],
} as const;

export const keyUnitOnGroup = {
  create: ["unitOnGroup-create"],
  update: ["unitOnGroup-update"],
  delete: ["unitOnGroup-delete"],
  reorder: ["unitOnGroup-reorder"],
} as const;

export const keyStudentOnGroup = {
  create: ["studentOnGroup-create"],
  update: ["studentOnGroup-update"],
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
          return [...(prev ?? []), data];
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

export function useRefetchGroupOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyGroupOnSubject.refetch,
    mutationFn: (request: RequestRefetchGroupOnSubjectService) =>
      RefetchGroupOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.id }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return data;
        }
      );
      queryClient.refetchQueries({
        queryKey: keyGroupOnSubject.getById({
          id: data.id,
        }),
      });
    },
  });
}

export function useCreateUnitOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyUnitOnGroup.create,
    mutationFn: (request: RequestCreateUnitOnGroupService) =>
      CreateUnitOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return { ...prev, units: [...prev.units, { ...data, students: [] }] };
        }
      );
      queryClient.refetchQueries({
        queryKey: keyGroupOnSubject.getById({
          id: data.groupOnSubjectId,
        }),
      });
    },
  });
}

export function useUpdateUnitOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyUnitOnGroup.update,
    mutationFn: (request: RequestUpdateUnitOnGroupService) =>
      UpdateUnitOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return {
            ...prev,
            units: prev.units.map((u) => {
              if (u.id === data.id) {
                return { ...data, students: u.students };
              }
              return u;
            }),
          };
        }
      );
      queryClient.refetchQueries({
        queryKey: keyGroupOnSubject.getById({
          id: data.groupOnSubjectId,
        }),
      });
    },
  });
}

export function useReorderUnitGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyUnitOnGroup.reorder,
    mutationFn: (request: RequestReorderUnitOnGroupService) =>
      ReorderUnitOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data[0].groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return {
            ...prev,
            units: data.map((u) => {
              const students = prev.units.find(
                (prevUnit) => prevUnit.id === u.id
              );
              return { ...u, students: students?.students ?? [] };
            }),
          };
        }
      );
    },
  });
}

export function useDeleteUnitOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyUnitOnGroup.delete,
    mutationFn: (request: RequestDeleteUnitOnGroupService) =>
      DeleteUnitOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return {
            ...prev,
            units: prev.units.filter((u) => u.id !== data.id),
          };
        }
      );
      queryClient.refetchQueries({
        queryKey: keyGroupOnSubject.getById({
          id: data.groupOnSubjectId,
        }),
      });
    },
  });
}

export function useCreateStudentOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyStudentOnGroup.update,
    mutationFn: (request: RequestCreateStudentOnGroupService) =>
      CreateStudentOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          const oldStudent = prev.units
            .flatMap((u) => u.students)
            .find((s) => s.id === variables.studentOnSubjectId);
          return {
            ...prev,
            units: prev.units.map((unit) => {
              if (unit.id === data.unitOnGroupId) {
                return { ...unit, students: [...unit.students, data] };
              } else if (unit.id === oldStudent?.unitOnGroupId) {
                return {
                  ...unit,
                  students: unit.students.filter((s) => s.id !== oldStudent.id),
                };
              }
              return unit;
            }),
          };
        }
      );
    },
  });
}

export function useUpdateStudentOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyStudentOnGroup.update,
    mutationFn: (request: RequestUpdateStudentOnGroupService) =>
      UpdateStudentOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return {
            ...prev,
            units: prev.units.map((unit) => {
              if (unit.id !== data.unitOnGroupId) {
                return unit;
              }

              return { ...unit, students: [...unit.students, data] };
            }),
          };
        }
      );
    },
  });
}

export function useReorderStudentOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyStudentOnGroup.reorder,
    mutationFn: (request: RequestReorderStudentOnGroupService) =>
      ReorderStudentOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data[0].groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return {
            ...prev,
            units: prev.units.map((unit) => {
              if (unit.id !== data[0].unitOnGroupId) {
                return unit;
              }

              return { ...unit, students: data };
            }),
          };
        }
      );
    },
  });
}

export function useDeleteStudentOnGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyStudentOnGroup.delete,
    mutationFn: (request: RequestDeleteStudentOnGroupService) =>
      DeleteStudentOnGroupService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        keyGroupOnSubject.getById({ id: data.groupOnSubjectId }),
        (
          prev: ResponseGetGroupOnSubjectService
        ): ResponseGetGroupOnSubjectService => {
          return {
            ...prev,
            units: prev.units.map((unit) => {
              if (unit.id !== data.unitOnGroupId) {
                return unit;
              }

              return {
                ...unit,
                students: unit.students.filter((s) => s.id !== data.id),
              };
            }),
          };
        }
      );
    },
  });
}
