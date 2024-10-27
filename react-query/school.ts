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

export function useGetSchool({
  schoolId,
}: {
  schoolId: string;
}): UseQueryResult<School, Error> {
  return useQuery({
    queryKey: ["school", { id: schoolId }],
    queryFn: () => GetSchoolByIdService({ schoolId }),
  });
}

export function useGetMemberBySchool(request: {
  schoolId: string;
}): UseQueryResult<MemberOnSchool[], Error> {
  return useQuery({
    queryKey: ["member-on-school", { schoolId: request.schoolId }],
    queryFn: () => GetMembersBySchoolIdService({ schoolId: request.schoolId }),
  });
}
