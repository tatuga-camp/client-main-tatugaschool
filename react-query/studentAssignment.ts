import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeleteFileOnStudentAssignmentService,
  GetStudentOnAssignmentsByAssignmentIdService,
  RequestDeleteFileOnStudentAssignmentService,
  RequestUpdateFileOnStudentAssignmentService,
  RequestUpdateStudentOnAssignmentService,
  ResponseGetStudentOnAssignmentsService,
  UpdateFileOnStudentAssignmentService,
  UpdateStudentOnAssignmentService,
} from "../services";

export function useGetStudentOnAssignments({
  assignmentId,
  refetchInterval = false,
}: {
  assignmentId: string;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: ["student-assignments", { assignmentId: assignmentId }],
    queryFn: () =>
      GetStudentOnAssignmentsByAssignmentIdService({
        assignmentId,
      }),
    refetchInterval: refetchInterval,
  });
}

export function useUpdateStudentOnAssignments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-student-assignments"],
    mutationFn: (request: RequestUpdateStudentOnAssignmentService) =>
      UpdateStudentOnAssignmentService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["student-assignments", { assignmentId: data.assignmentId }],
        (
          oldData: ResponseGetStudentOnAssignmentsService
        ): ResponseGetStudentOnAssignmentsService => {
          return oldData?.map((prevStudentAssignment) => {
            if (prevStudentAssignment.id === data.id) {
              return { ...data, files: prevStudentAssignment.files };
            } else {
              return prevStudentAssignment;
            }
          });
        }
      );
    },
  });
}

export function useUpdateFileStudentOnAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-file-student-assignments"],
    mutationFn: (input: RequestUpdateFileOnStudentAssignmentService) =>
      UpdateFileOnStudentAssignmentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["student-assignments", { assignmentId: data.assignmentId }],
        (oldData: ResponseGetStudentOnAssignmentsService) => {
          return oldData?.map((prevStudentAssignment) => {
            if (prevStudentAssignment.id === data.studentOnAssignmentId) {
              const filterOutUpdate = prevStudentAssignment.files.map((f) =>
                f.id === data.id ? data : f
              );
              return {
                ...prevStudentAssignment,
                files: filterOutUpdate,
              };
            } else {
              return prevStudentAssignment;
            }
          });
        }
      );
    },
  });
}

export function useDeleteFileStudentOnAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-file-student-assignments"],
    mutationFn: (input: RequestDeleteFileOnStudentAssignmentService) =>
      DeleteFileOnStudentAssignmentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["student-assignments", { assignmentId: data.assignmentId }],
        (oldData: ResponseGetStudentOnAssignmentsService) => {
          return oldData?.map((prevStudentAssignment) => {
            if (prevStudentAssignment.id === data.studentOnAssignmentId) {
              const filterOutDelete = prevStudentAssignment.files.filter(
                (f) => f.id !== data.id
              );
              return {
                ...prevStudentAssignment,
                files: filterOutDelete,
              };
            } else {
              return prevStudentAssignment;
            }
          });
        }
      );
    },
  });
}
