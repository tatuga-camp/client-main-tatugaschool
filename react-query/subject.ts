import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { EducationYear, Subject, TeacherOnSubject } from "../interfaces";
import {
  CreateSubjectService,
  DeleteSubjectService,
  DeleteTeacherOnSubjectService,
  DuplicateSubjectService,
  GetSubjectByIdService,
  GetSubjectBySchoolsBySchoolIdService,
  GetTeacherOnSubjectBySubjectService,
  ReorderSubjectsService,
  RequestCreateSubjectService,
  RequestDeleteSubjectService,
  RequestDeleteTeacherOnSubjectService,
  RequestDuplicateSubjectService,
  RequestGetSubjectBySchoolsService,
  RequestReorderSubjectsService,
  RequestUpdateSubjectService,
  ResponseGetSubjectBySchoolsService,
  UpdateSubjectService,
} from "../services";
import {
  getSortStudentLocaStorage,
  removeSortStudentLocalStorage,
  setSortStudentLocaStorage,
} from "../utils";
import { FilterTitle } from "../components/common/Filter";

export function useGetSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<Subject, Error> {
  return useQuery({
    queryKey: ["subject", { id: subjectId }],
    queryFn: () =>
      GetSubjectByIdService({
        subjectId: subjectId,
      }),
  });
}

export function useGetSubjectFromSchool(
  input: RequestGetSubjectBySchoolsService,
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
      },
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
          prevs: ResponseGetSubjectBySchoolsService,
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
        },
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

export function useDuplicateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["duplicate-subject"],
    mutationFn: (request: RequestDuplicateSubjectService) =>
      DuplicateSubjectService(request),

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
        },
      );
      variables.queryClient.invalidateQueries({
        queryKey: ["subjects", { schoolId: data.schoolId }],
      });
    },
  });
  return updateSubject;
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
            (teacher) => teacher.id !== variables.request.teacherOnSubjectId,
          );
        },
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

export function useGetSortConfigOnSubject(input: { subjectId: string }) {
  return useQuery({
    queryKey: ["sort-config", { subject: input.subjectId }],
    queryFn: () => {
      const response = getSortStudentLocaStorage({
        subjectId: input.subjectId,
      });

      console.log(response);

      return response;
    },
  });
}

export function useDeleteSortConfigOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-sort-config"],
    mutationFn: (request: { subjectId: string }) => {
      removeSortStudentLocalStorage({
        subjectId: request.subjectId,
      });
      queryClient.setQueryData(
        ["sort-config", { subject: request.subjectId }],
        ():
          | {
              title: FilterTitle;
              orderBy: "asc" | "desc";
            }
          | { title: "default" } => {
          return { title: "default" };
        },
      );
      return Promise.resolve(request);
    },
  });
}

export function useUpdateSortConfigOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-sort-config"],
    mutationFn: (request: {
      subjectId: string;
      sort: {
        title: FilterTitle;
        orderBy: "asc" | "desc";
      };
    }) => {
      setSortStudentLocaStorage({
        subjectId: request.subjectId,
        sort: request.sort,
      });
      queryClient.setQueryData(
        ["sort-config", { subject: request.subjectId }],
        (): {
          title: FilterTitle;
          orderBy: "asc" | "desc";
        } => {
          return request.sort;
        },
      );
      return Promise.resolve(request);
    },
  });
}
