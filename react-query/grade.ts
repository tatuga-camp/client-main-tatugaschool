import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetOverviewAssignmentService,
  RequestUpdateStudentOnAssignmentService,
  ResponseGetOverviewAssignmentService,
  UpdateStudentOnAssignmentService,
} from "../services";

export function useGetAssignmentOverview(input: { subjectId: string }) {
  return useQuery({
    queryKey: ["assignment-overview", { subjectId: input.subjectId }],
    queryFn: () => GetOverviewAssignmentService(input),
  });
}

export function useUpdateAssignmentOverview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-assignment-overview"],
    mutationFn: (request: RequestUpdateStudentOnAssignmentService) =>
      UpdateStudentOnAssignmentService(request),
    onSuccess(updateData, variables, context) {
      queryClient.setQueryData(
        ["assignment-overview", { subjectId: updateData.subjectId }],
        (oldData: ResponseGetOverviewAssignmentService) => {
          return oldData?.map((prevAssignment) => {
            if (prevAssignment.assignment.id === updateData.assignmentId) {
              return {
                ...prevAssignment,
                students: prevAssignment.students.map((studentOnAssignment) => {
                  if (studentOnAssignment.id === updateData.id) {
                    return updateData;
                  }
                  return studentOnAssignment;
                }),
              };
            }
            return prevAssignment;
          });
        }
      );
    },
  });
}
