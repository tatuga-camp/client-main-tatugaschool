import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateSchoolService,
  GetMembersBySchoolIdService,
  GetSchoolByIdService,
  GetSchoolService,
  RequestCreateSchoolService,
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
