import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetUserByEmailService, GetUserService } from "../services";
import { User } from "../interfaces";

export function useGetUser(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => GetUserService(),
  });
}

export function useGetUserByEmail(
  email: string
): UseQueryResult<User[], Error> {
  return useQuery({
    queryKey: ["users", { email }],
    queryFn: () => GetUserByEmailService({ email }),
  });
}
