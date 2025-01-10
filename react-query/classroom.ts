import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetClassesBySchoolIdService,
  ReorderClassesService,
  RequestetClassesBySchoolIdService,
  RequestReorderClassesService,
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
