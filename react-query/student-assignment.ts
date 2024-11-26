import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetStudentOnAssignmentsByAssignmentIdService,
  RequestUpdateStudentOnAssignmentService,
  ResponseGetStudentOnAssignmentsService,
  UpdateStudentOnAssignmentService,
} from "../services";

export function useGetStudentOnAssignments({
  assignmentId,
}: {
  assignmentId: string;
}) {
  return useQuery({
    queryKey: ["student-assignments", { assignmentId: assignmentId }],
    queryFn: () =>
      GetStudentOnAssignmentsByAssignmentIdService({
        assignmentId,
      }),
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
