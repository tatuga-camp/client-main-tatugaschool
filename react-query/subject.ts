import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  EducationYear,
  ScoreOnStudent,
  StudentOnSubject,
  Subject,
  TeacherOnSubject,
} from "../interfaces";
import {
  CreateSubjectService,
  DeleteSubjectService,
  DeleteTeacherOnSubjectService,
  GetScoresByStudentOnSubjectIdService,
  GetStudentOnSubjectBySubjectService,
  GetSubjectByIdService,
  GetSubjectBySchoolsBySchoolIdService,
  GetTeacherOnSubjectBySubjectService,
  ReorderSubjectsService,
  RequestCreateSubjectService,
  RequestDeleteSubjectService,
  RequestDeleteTeacherOnSubjectService,
  RequestGetSubjectBySchoolsService,
  RequestReorderSubjectsService,
  RequestUpdateStudentOnSubjectService,
  RequestUpdateSubjectService,
  ResponseGetSubjectBySchoolsService,
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

export function useGetSubjectFromSchool(
  input: RequestGetSubjectBySchoolsService
) {
  return useQuery({
    queryKey: [
      "subjects",
      { schoolId: input.schoolId, educationYear: input.educationYear },
    ],
    queryFn: () => GetSubjectBySchoolsBySchoolIdService(input),
    enabled: !!input.schoolId && !!input.educationYear,
  });
}

export function useReorderSubjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reorder-subjects"],
    mutationFn: (
      input: RequestReorderSubjectsService & {
        schoolId: string;
        educationYear: EducationYear;
      }
    ) => ReorderSubjectsService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "subjects",
          {
            schoolId: variables.schoolId,
            educationYear: variables.educationYear,
          },
        ],
        (
          prevs: ResponseGetSubjectBySchoolsService
        ): ResponseGetSubjectBySchoolsService => {
          return prevs.map((subject) => {
            const newOrder = data.find((d) => d.id === subject.id);
            if (newOrder) {
              return {
                ...newOrder,
                teachers: subject.teachers,
                class: subject.class,
              };
            } else {
              return subject;
            }
          });
        }
      );
    },
  });
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

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-subject"],
    mutationFn: (request: RequestCreateSubjectService) =>
      CreateSubjectService(request),

    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: [
          "subjects",
          { schoolId: data.schoolId, educationYear: data.educationYear },
        ],
      });
    },
  });
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
      variables.queryClient.invalidateQueries({
        queryKey: ["subjects", { schoolId: data.schoolId }],
      });
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
      variables.queryClient.invalidateQueries({
        queryKey: [
          "subjects",
          { schoolId: data.schoolId, educationYear: data.educationYear },
        ],
      });
    },
  });
  return deleteSubject;
}
