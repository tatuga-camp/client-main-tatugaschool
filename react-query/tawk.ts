import { useQuery } from "@tanstack/react-query";
import {
  GetUserTawkHashService,
  ResponseGetUserTawkHashService,
} from "../services";
import { useGetUser } from "./user";

export function useGetTawkHash() {
  const user = useGetUser();
  return useQuery<ResponseGetUserTawkHashService, Error>({
    queryKey: ["tawk-hash"],
    queryFn: () => GetUserTawkHashService(),
    enabled: !!user.data,
    staleTime: Infinity,
  });
}
