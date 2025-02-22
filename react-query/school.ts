import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateSchoolService,
  DeleteSchoolService,
  GetMembersBySchoolIdService,
  GetSchoolByIdService,
  GetSchoolService,
  RequestCreateSchoolService,
  RequestDeleteSchoolService,
  RequestUpdateSchoolService,
  ResponseGetSchoolService,
  UpdateSchoolService,
} from "../services";
import { MemberOnSchool, School } from "../interfaces";

export function useGetSchools(): UseQueryResult<School[], Error> {
  return useQuery({
    queryKey: ["schools"],
    queryFn: () => GetSchoolService(),
  });
}

export function useGetSchool({ schoolId }: { schoolId: string }) {
  return useQuery({
    queryKey: ["school", { id: schoolId }],
    queryFn: () => GetSchoolByIdService({ schoolId }),
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["school"],
    mutationFn: (input: RequestCreateSchoolService) =>
      CreateSchoolService(input),
    onSuccess(data, _variables, _context) {
      const prevsData = queryClient.getQueryData(["schools"]);
      if (prevsData) {
        queryClient.setQueryData(["schools"], (old: School[] | undefined) => {
          return [...(old || []), data];
        });
      }
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-school"],
    mutationFn: (input: RequestUpdateSchoolService) =>
      UpdateSchoolService(input),
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(
        ["school", { id: data.id }],
        (oldData: ResponseGetSchoolService) => {
          return { ...oldData, ...data };
        }
      );
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-school"],
    mutationFn: (request: RequestDeleteSchoolService) =>
      DeleteSchoolService(request),
    onSuccess(data, variables, context) {
      const prevsData = queryClient.getQueryData(["schools"]);
      if (prevsData) {
        queryClient.setQueryData(["schools"], (old: School[] | undefined) => {
          return old?.filter((s) => s.id !== data.id);
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["school", { id: data.id }],
      });
    },
  });
}
