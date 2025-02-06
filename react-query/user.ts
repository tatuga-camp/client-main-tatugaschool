import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  GetNoVerifyUserService,
  GetUserByEmailService,
  GetUserService,
  RequestUpdateUserService,
  ResendVerifiyEmail,
  UpdateUserService,
} from "../services";
import { User } from "../interfaces";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

export function useGetUser() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => GetUserService(),
  });
  if (query.error && query.error?.message === "Email not verified") {
    Swal.fire({
      title: "Email not verified",
      text: "Please verify your email",
      icon: "warning",
    });
    router.push("/auth/wait-verify-email");
  }
  return query;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-user"],
    mutationFn: (input: RequestUpdateUserService) => UpdateUserService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(["user"], data);
    },
  });
}

export function useGetNoVerifyUser() {
  const query = useQuery({
    queryKey: ["noverify-user"],
    queryFn: () => GetNoVerifyUserService(),
  });
  return query;
}

export function useResendVerifyEmail() {
  return useMutation({
    mutationKey: ["resend-verify-email"],
    mutationFn: () => ResendVerifiyEmail(),
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
