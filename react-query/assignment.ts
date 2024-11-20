import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAssignmentService,
  GetAssignmentByIdService,
  GetAssignmentsBySubjectIdService,
  RequestCreateAssignmentService,
  ResponseGetAssignmentsService,
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

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-assignment"],
    mutationFn: (request: RequestCreateAssignmentService) =>
      CreateAssignmentService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["assignments", { subjectId: data.subjectId }],
        (oldData: ResponseGetAssignmentsService) => {
          return [...(oldData ?? []), data];
        }
      );
    },
  });
}
