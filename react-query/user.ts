import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetUserByEmailService, GetUserService } from "../services";
import { User } from "../interfaces";

export function getUser(): UseQueryResult<User, Error> {
  const user = useQuery({
    queryKey: ["user"],
    queryFn: () => GetUserService(),
  });
  return user;
}

export function getUserByEmail(request: {
  email: string;
}): UseQueryResult<User[], Error> {
  const users = useQuery({
    queryKey: [
      "users",
      {
        email: request.email,
      },
    ],
    queryFn: () => GetUserByEmailService({ email: request.email }),
  });
  return users;
}
