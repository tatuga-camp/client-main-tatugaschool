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
  GetSchoolService,
  RequestCreateSchoolService,
} from "../services";
import { MemberOnSchool, School } from "../interfaces";

export function getSchools(): UseQueryResult<School[], Error> {
  const schools = useQuery({
    queryKey: ["schools"],
    queryFn: () => GetSchoolService(),
  });
  return schools;
}

export function getMemberBySchool(request: {
  id: string;
}): UseQueryResult<MemberOnSchool[], Error> {
  const memberOnSchools = useQuery({
    queryKey: ["member-on-school", { schoolId: request.id }],
    queryFn: () =>
      GetMembersBySchoolIdService({
        schoolId: request.id,
      }),
  });
  return memberOnSchools;
}
