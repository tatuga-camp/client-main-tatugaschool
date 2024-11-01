import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  ScoreOnStudent,
  StudentOnSubject,
  Subject,
  TeacherOnSubject,
} from "../interfaces";
import {
  DeleteSubjectService,
  DeleteTeacherOnSubjectService,
  GetScoresByStudentOnSubjectIdService,
  GetStudentOnSubjectBySubjectService,
  GetSubjectByIdService,
  GetTeacherOnSubjectBySubjectService,
  RequestDeleteSubjectService,
  RequestDeleteTeacherOnSubjectService,
  RequestUpdateStudentOnSubjectService,
  RequestUpdateSubjectService,
  UpdateStudentOnSubjectService,
  UpdateSubjectService,
} from "../services";

export function useGetSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<Subject, Error> {
  const schools = useQuery({
    queryKey: ["subject", { id: subjectId }],
    queryFn: () =>
      GetSubjectByIdService({
        subjectId: subjectId,
      }),
  });
  return schools;
}

export function useGetTeacherOnSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<TeacherOnSubject[], Error> {
  const teachers = useQuery({
    queryKey: ["teacherOnSubject", { subjectId: subjectId }],
    queryFn: () =>
      GetTeacherOnSubjectBySubjectService({
        subjectId: subjectId,
      }),
  });
  return teachers;
}

export function useGetStudentOnSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<StudentOnSubject[], Error> {
  const students = useQuery({
    queryKey: ["studentOnSubjects", { subjectId: subjectId }],
    queryFn: () =>
      GetStudentOnSubjectBySubjectService({
        subjectId: subjectId,
      }),
  });
  return students;
}

export function useUpdateSubject() {
  const updateSubject = useMutation({
    mutationKey: ["updateSubject"],
    mutationFn: (request: {
      request: RequestUpdateSubjectService;
      queryClient: QueryClient;
    }) => UpdateSubjectService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["subject", { id: data.id }],
        (prev: Subject) => {
          return data;
        }
      );
    },
  });
  return updateSubject;
}

export function useUpdateStudentOnSubject() {
  const updateStudentOnSubject = useMutation({
    mutationKey: ["update-student-on-subject"],
    mutationFn: (request: {
      request: RequestUpdateStudentOnSubjectService;
      queryClient: QueryClient;
    }) => UpdateStudentOnSubjectService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["studentOnSubjects", { subjectId: data.subjectId }],
        (prev: StudentOnSubject[]) => {
          return prev.map((student) => {
            if (student.id === data.id) {
              return data;
            }
            return student;
          });
        }
      );
    },
  });
  return updateStudentOnSubject;
}

export function useDeleteTeacherOnSubject() {
  const deleteTeacherOnSubject = useMutation({
    mutationKey: ["delete-teacher-on-subject"],
    mutationFn: (request: {
      request: RequestDeleteTeacherOnSubjectService;
      subjectId: string;
      queryClient: QueryClient;
    }) => DeleteTeacherOnSubjectService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["teacherOnSubject", { subjectId: variables.subjectId }],
        (oldData: TeacherOnSubject[]) => {
          return oldData.filter(
            (teacher) => teacher.id !== variables.request.teacherOnSubjectId
          );
        }
      );
    },
  });
  return deleteTeacherOnSubject;
}

export function useDeleteSubject() {
  const deleteSubject = useMutation({
    mutationKey: ["delete-subject"],
    mutationFn: (request: {
      request: RequestDeleteSubjectService;
      queryClient: QueryClient;
    }) => DeleteSubjectService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.invalidateQueries({
        queryKey: ["subject", { id: variables.request.subjectId }],
      });
    },
  });
  return deleteSubject;
}
