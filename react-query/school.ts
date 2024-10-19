import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateSchoolService,
  GetSchoolService,
  RequestCreateSchoolService,
} from "../services";
import { School } from "../interfaces";

export function getSchools(): UseQueryResult<School[], Error> {
  const schools = useQuery({
    queryKey: ["schools"],
    queryFn: () => GetSchoolService(),
  });
  return schools;
}
