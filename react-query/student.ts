import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateStudentService,
  DeleteStudentService,
  RequestCreateStudentService,
  RequestUpdateStudentService,
  ResponseGetClassByIdService,
  UpdateStudentService,
} from "../services";

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-student"],
    mutationFn: (input: RequestCreateStudentService) =>
      CreateStudentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["classroom", { id: data.classId }],
        (oldData: ResponseGetClassByIdService): ResponseGetClassByIdService => {
          return {
            ...oldData,
            students: [data, ...oldData.students],
          };
        }
      );
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-student"],
    mutationFn: (input: RequestUpdateStudentService) =>
      UpdateStudentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["classroom", { id: data.classId }],
        (oldData: ResponseGetClassByIdService): ResponseGetClassByIdService => {
          return {
            ...oldData,
            students: oldData.students.map((student) =>
              student.id === data.id ? data : student
            ),
          };
        }
      );
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-student"],
    mutationFn: (input: { studentId: string }) => DeleteStudentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["classroom", { id: data.classId }],
        (oldData: ResponseGetClassByIdService): ResponseGetClassByIdService => {
          return {
            ...oldData,
            students: oldData.students.filter(
              (student) => student.id !== data.id
            ),
          };
        }
      );
    },
  });
}
