import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetStudentOnSubjectBySubjectService,
  GetStudentOnSubjectReportService,
  RequestSortStudentOnSubjectService,
  RequestUpdateStudentOnSubjectService,
  SortStudentOnSubjectService,
  UpdateStudentOnSubjectService,
} from "../services";
import { StudentOnSubject } from "../interfaces";
import { imageUrlToBase64 } from "../utils";

const keyStudentOnSubject = {
  getAll: ["studentOnSubjects"],
  getBySubject: (request: { subjectId: string }) => [
    keyStudentOnSubject.getAll[0],
    { subjectId: request.subjectId },
  ],
  getReport: (request: { studentOnSubjectId: string }) => [
    keyStudentOnSubject.getAll[0],
    { studentOnSubjectId: request.studentOnSubjectId },
    "report",
  ],
  update: ["update-student-on-subject"],
  reorder: ["reorder-student-on-subject"],
} as const;

export function useGetStudentOnSubject({ subjectId }: { subjectId: string }) {
  return useQuery({
    queryKey: keyStudentOnSubject.getBySubject({ subjectId }),
    queryFn: () =>
      GetStudentOnSubjectBySubjectService({
        subjectId: subjectId,
      }),
  });
}

export function useGetStudentOnSubjectReport({
  studentOnSubjectId,
}: {
  studentOnSubjectId: string;
}) {
  return useQuery({
    queryKey: keyStudentOnSubject.getReport({ studentOnSubjectId }),
    queryFn: () =>
      GetStudentOnSubjectReportService({
        studentOnSubjectId,
      }),
  });
}
export function useUpdateStudentOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyStudentOnSubject.update,
    mutationFn: (request: RequestUpdateStudentOnSubjectService) =>
      UpdateStudentOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["studentOnSubjects", { subjectId: data.subjectId }],
        (prev: StudentOnSubject[]) => {
          return prev.map((student) => {
            if (student.id === data.id) {
              return data;
            }
            return student;
          });
        },
      );
    },
  });
}

export function useReorderStudentOnSubject(subjectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keyStudentOnSubject.reorder,
    mutationFn: (request: RequestSortStudentOnSubjectService) =>
      SortStudentOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData<StudentOnSubject[]>(
        ["studentOnSubjects", { subjectId }],
        () => data,
      );
    },
  });
}
