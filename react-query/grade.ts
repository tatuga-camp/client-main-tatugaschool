import { RequestUpdateAssignmentService } from "./../services/assignments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateGradeService,
  GetOverviewAssignmentService,
  RequestCreateGradeService,
  RequestUpdateGradeService,
  RequestUpdateStudentOnAssignmentService,
  ResponseGetOverviewAssignmentService,
  UpdateAssignmentService,
  UpdateGradeService,
  UpdateStudentOnAssignmentService,
} from "../services";

export const gradeKey = {
  overview: (key: { subjectId: string }) => [
    "assignment-overview",
    { subjectId: key.subjectId },
  ],
} as const;
export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-grade"],
    mutationFn: (request: RequestCreateGradeService) =>
      CreateGradeService(request),
    onSuccess(data, variables, context) {
      const overview = queryClient.getQueryData(
        gradeKey.overview({ subjectId: data.subjectId })
      );
      if (overview) {
        queryClient.setQueryData(
          gradeKey.overview({ subjectId: data.subjectId }),
          (
            prev: ResponseGetOverviewAssignmentService
          ): ResponseGetOverviewAssignmentService => {
            return {
              assignments: prev.assignments,
              grade: data,
            };
          }
        );
      }
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-grade"],
    mutationFn: (request: RequestUpdateGradeService) =>
      UpdateGradeService(request),
    onSuccess(data, variables, context) {
      const overview = queryClient.getQueryData(
        gradeKey.overview({ subjectId: data.subjectId })
      );
      if (overview) {
        queryClient.setQueryData(
          gradeKey.overview({ subjectId: data.subjectId }),
          (
            prev: ResponseGetOverviewAssignmentService
          ): ResponseGetOverviewAssignmentService => {
            return {
              assignments: prev.assignments,
              grade: data,
            };
          }
        );
      }
    },
  });
}

export function useGetAssignmentOverview(input: { subjectId: string }) {
  return useQuery({
    queryKey: gradeKey.overview({ subjectId: input.subjectId }),
    queryFn: () => GetOverviewAssignmentService(input),
  });
}

export function useUpdateAssignmentOverview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-assignment-overview"],
    mutationFn: (request: RequestUpdateAssignmentService) =>
      UpdateAssignmentService(request),
    onSuccess(updateData, variables, context) {
      queryClient.setQueryData(
        gradeKey.overview({ subjectId: updateData.subjectId }),
        (
          oldData: ResponseGetOverviewAssignmentService
        ): ResponseGetOverviewAssignmentService => {
          return {
            grade: oldData.grade,
            assignments: oldData?.assignments.map((prevAssignment) => {
              if (prevAssignment.assignment.id === updateData.id) {
                return {
                  assignment: updateData,
                  students: prevAssignment.students,
                };
              }
              return prevAssignment;
            }),
          };
        }
      );
    },
  });
}

export function useUpdateStudentAssignmentOverview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-student-assignment-overview"],
    mutationFn: (request: RequestUpdateStudentOnAssignmentService) =>
      UpdateStudentOnAssignmentService(request),
    onSuccess(updateData, variables, context) {
      queryClient.setQueryData(
        gradeKey.overview({ subjectId: updateData.subjectId }),
        (
          oldData: ResponseGetOverviewAssignmentService
        ): ResponseGetOverviewAssignmentService => {
          return {
            grade: oldData.grade,
            assignments: oldData?.assignments.map((prevAssignment) => {
              if (prevAssignment.assignment.id === updateData.assignmentId) {
                return {
                  ...prevAssignment,
                  students: prevAssignment.students.map(
                    (studentOnAssignment) => {
                      if (studentOnAssignment.id === updateData.id) {
                        return updateData;
                      }
                      return studentOnAssignment;
                    }
                  ),
                };
              }
              return prevAssignment;
            }),
          };
        }
      );
    },
  });
}
