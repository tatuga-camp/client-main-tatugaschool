import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetUserService } from "../services";
import { User } from "../interfaces";

export function getUser(): UseQueryResult<User, Error> {
  const user = useQuery({
    queryKey: ["user"],
    queryFn: () => GetUserService(),
  });
  return user;
}
