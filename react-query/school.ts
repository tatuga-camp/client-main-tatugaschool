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

export function getSchools(): UseQueryResult<School[], Error> {
  const schools = useQuery({
    queryKey: ["schools"],
    queryFn: () => GetSchoolService(),
  });
  return schools;
}

export function getSchool({
  schoolId,
}: {
  schoolId: string;
}): UseQueryResult<School, Error> {
  const school = useQuery({
    queryKey: ["school", { id: schoolId }],
    queryFn: () => GetSchoolByIdService({ schoolId }),
  });
  return school;
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
