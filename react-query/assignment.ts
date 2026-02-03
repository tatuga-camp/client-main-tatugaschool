import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAssignmentService,
  CreateFileAssignmentService,
  DeleteAssignmentService,
  DeleteFileAssignmentService,
  GetAssignmentByIdService,
  GetAssignmentsBySubjectIdService,
  ReorderAssignmentService,
  RequestCreateAssignmentService,
  RequestCreateFileAssignmentService,
  RequestDeleteAssignmentService,
  RequestDeleteFileAssignmentService,
  RequestReorderAssignmentService,
  RequestUpdateAssignmentService,
  RequestUpdateFileAssignmentService,
  RequestUpdateSkillToAssignmentService,
  ResponseGetAssignmentByIdService,
  ResponseGetAssignmentsService,
  UpdateAssignmentService,
  UpdateFileAssignmentService,
  UpdateSkillToAssignmentService,
} from "../services";

export function useGetAssignments({ subjectId }: { subjectId: string }) {
  return useQuery({
    queryKey: ["assignments", { subjectId: subjectId }],
    queryFn: () =>
      GetAssignmentsBySubjectIdService({
        subjectId,
      }),
  });
}

export function useGetAssignment({ id }: { id: string }) {
  return useQuery({
    queryKey: ["assignment", { id: id }],
    queryFn: () => GetAssignmentByIdService({ assignmentId: id }),
  });
}

export function useUpdateSkillToAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-skill-assignment"],
    mutationFn: (request: RequestUpdateSkillToAssignmentService) =>
      UpdateSkillToAssignmentService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["assignment", { id: variables.assignmentId }],
      });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-assignment"],
    mutationFn: (request: RequestUpdateAssignmentService) =>
      UpdateAssignmentService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return oldData?.map((prevAssignment) => {
            if (prevAssignment.id === data.id) {
              return { ...data, files: prevAssignment.files };
            } else {
              return prevAssignment;
            }
          });
        },
      );
      queryClient.setQueryData(
        ["assignment", { id: data.id }],
        (
          prev: ResponseGetAssignmentByIdService,
        ): ResponseGetAssignmentByIdService => {
          return { ...data, files: prev.files, skills: prev.skills };
        },
      );
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const updateSkill = useUpdateSkillToAssignment();
  return useMutation({
    mutationKey: ["create-assignment"],
    mutationFn: (request: RequestCreateAssignmentService) =>
      CreateAssignmentService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return [...(oldData ?? []), data];
        },
      );

      if (data.type === "Assignment") {
        updateSkill.mutate({
          assignmentId: data.id,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["assignment-overview", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-assignment"],
    mutationFn: (request: RequestDeleteAssignmentService) =>
      DeleteAssignmentService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return oldData?.filter((assignment) => assignment.id !== data.id);
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["assignment", { id: data.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["assignment-overview", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useReoderAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reorder-assignment"],
    mutationFn: (request: {
      request: RequestReorderAssignmentService;
      subjectId: string;
    }) => ReorderAssignmentService(request.request),
    onSuccess(newDatas, variables, context) {
      queryClient.setQueryData(
        ["assignments", { subjectId: variables.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return oldData?.map((prevAssignment) => {
            const newAssignment = newDatas.find(
              (newData) => newData.id === prevAssignment.id,
            );
            if (newAssignment) {
              return {
                ...newAssignment,
                files: prevAssignment.files,
              };
            } else {
              return prevAssignment;
            }
          });
        },
      );
    },
  });
}

export function useCreateFileOnAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-file-assignment"],
    mutationFn: (request: RequestCreateFileAssignmentService) =>
      CreateFileAssignmentService(request),
    onSuccess(data, variables, context) {
      const cacheAssignment = queryClient.getQueryData([
        "assignment",
        { id: data.assignmentId },
      ]);
      if (cacheAssignment) {
        queryClient.setQueryData(
          ["assignment", { id: data.assignmentId }],
          (oldData: ResponseGetAssignmentByIdService) => {
            return {
              ...oldData,
              files: [...oldData.files, data],
            };
          },
        );
      }
      const cacheAssignments = queryClient.getQueryData([
        "assignments",
        { subjectId: data.subjectId },
      ]);
      if (!cacheAssignments) return;
      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return oldData.map((prevAssignment) => {
            if (prevAssignment.id === data.assignmentId) {
              return {
                ...prevAssignment,
                files: [...prevAssignment.files, data],
              };
            } else {
              return prevAssignment;
            }
          });
        },
      );
    },
  });
}
export function useUpdateFileOnAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-file-assignment"],
    mutationFn: (request: RequestUpdateFileAssignmentService) =>
      UpdateFileAssignmentService(request),
    onSuccess(data, variables, context) {
      const cacheAssignment = queryClient.getQueryData([
        "assignment",
        { id: data.assignmentId },
      ]);

      if (cacheAssignment) {
        queryClient.setQueryData(
          ["assignment", { id: data.assignmentId }],
          (oldData: ResponseGetAssignmentByIdService) => {
            return {
              ...oldData,
              files: oldData.files.map((old) => {
                return old.id === data.id ? data : old;
              }),
            };
          },
        );
      }

      const cacheAssignments = queryClient.getQueryData([
        "assignments",
        { subjectId: data.subjectId },
      ]);

      if (!cacheAssignments) return;

      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return oldData.map((prevAssignment) => {
            if (prevAssignment.id === data.assignmentId) {
              return {
                ...prevAssignment,
                files: prevAssignment.files.filter((old) =>
                  old.id === data.id ? data : old,
                ),
              };
            } else {
              return prevAssignment;
            }
          });
        },
      );
    },
  });
}

export function useDeleteFileOnAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-file-assignment"],
    mutationFn: (request: RequestDeleteFileAssignmentService) =>
      DeleteFileAssignmentService(request),
    onSuccess(data, variables, context) {
      const cacheAssignment = queryClient.getQueryData([
        "assignment",
        { id: data.assignmentId },
      ]);

      if (cacheAssignment) {
        queryClient.setQueryData(
          ["assignment", { id: data.assignmentId }],
          (oldData: ResponseGetAssignmentByIdService) => {
            return {
              ...oldData,
              files: oldData.files.filter((file) => file.id !== data.id),
            };
          },
        );
      }

      const cacheAssignments = queryClient.getQueryData([
        "assignments",
        { subjectId: data.subjectId },
      ]);
      if (!cacheAssignments) return;
      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return oldData.map((prevAssignment) => {
            if (prevAssignment.id === data.assignmentId) {
              return {
                ...prevAssignment,
                files: prevAssignment.files.filter(
                  (file) => file.id !== data.id,
                ),
              };
            } else {
              return prevAssignment;
            }
          });
        },
      );
    },
  });
}
