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
  GetMembersBySchoolIdService,
  GetSchoolByIdService,
  GetSchoolService,
  RequestCreateSchoolService,
  RequestUpdateSchoolService,
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
        (oldData: School) => {
          return { ...oldData, ...data };
        }
      );
    },
  });
}
