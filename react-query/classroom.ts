import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateClassService,
  DeleteClassService,
  GetClassByIdService,
  GetClassesBySchoolIdService,
  GetGradeSummaryOnClassroomService,
  ReorderClassesService,
  RequestCreateClassService,
  RequestDeleteClassService,
  RequestetClassesBySchoolIdService,
  RequestGetClassByIdService,
  RequestGetGradeSummaryOnClassroomService,
  RequestReorderClassesService,
  RequestUpdateClassService,
  ResponseGetClassByIdService,
  ResponseGetClassesBySchoolIdService,
  UpdateClassService,
} from "../services";

export function useGetClassrooms(input: RequestetClassesBySchoolIdService) {
  return useQuery({
    queryKey: [
      "classrooms",
      { schoolId: input.schoolId, isAchieved: input.isAchieved },
    ],
    queryFn: () => GetClassesBySchoolIdService(input),
  });
}

export function useGetGradeSummaryReportOnClassroom(
  input: RequestGetGradeSummaryOnClassroomService
) {
  return useQuery({
    queryKey: ["grade-summary", { classId: input.classId }],
    queryFn: () => GetGradeSummaryOnClassroomService(input),
  });
}

export function useGetClassroom(
  input: RequestGetClassByIdService & {
    initialData?: ResponseGetClassByIdService;
  }
) {
  return useQuery({
    queryKey: ["classroom", { id: input.classId }],
    queryFn: () => GetClassByIdService(input),
    initialData: input.initialData,
  });
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateClassroom"],
    mutationFn: (input: RequestUpdateClassService) => UpdateClassService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["classroom", { id: variables.query.classId }],
        (oldData: ResponseGetClassByIdService): ResponseGetClassByIdService => {
          return { ...data, students: oldData.students };
        }
      );
      queryClient.refetchQueries({
        queryKey: ["classrooms", { schoolId: data.schoolId }],
      });
    },
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createClassroom"],
    mutationFn: (input: RequestCreateClassService) => CreateClassService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["classrooms", { schoolId: variables.schoolId, isAchieved: false }],
        (oldData: ResponseGetClassesBySchoolIdService) => {
          return [data, ...oldData];
        }
      );
    },
  });
}

export function useReorderClassrooms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reorderClassrooms"],
    mutationFn: (
      input: RequestReorderClassesService & {
        isAchieved: boolean;
        schoolId: string;
      }
    ) => ReorderClassesService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "classrooms",
          { schoolId: variables.schoolId, isAchieved: variables.isAchieved },
        ],
        (oldData: ResponseGetClassesBySchoolIdService) => {
          return oldData.map((classroom) => {
            const newData = data.find((d) => d.id === classroom.id);
            if (newData) {
              return { ...newData, studentNumbers: classroom.studentNumbers };
            }
            return classroom;
          });
        }
      );
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteClassroom"],
    mutationFn: (input: RequestDeleteClassService) => DeleteClassService(input),
    onSuccess(data, variables, context) {
      const classrooms = queryClient.getQueryData([
        "classrooms",
        { schoolId: data.schoolId, isAchieved: false },
      ]) as ResponseGetClassesBySchoolIdService;

      if (classrooms) {
        queryClient.setQueryData(
          ["classrooms", { schoolId: data.schoolId, isAchieved: false }],
          classrooms.filter((classroom) => classroom.id !== data.id)
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["classroom", { id: data.id }],
      });
    },
  });
}
