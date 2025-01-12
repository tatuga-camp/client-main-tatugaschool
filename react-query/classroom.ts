import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateClassService,
  GetClassByIdService,
  GetClassesBySchoolIdService,
  ReorderClassesService,
  RequestCreateClassService,
  RequestetClassesBySchoolIdService,
  RequestGetClassByIdService,
  RequestReorderClassesService,
  ResponseGetClassByIdService,
  ResponseGetClassesBySchoolIdService,
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
