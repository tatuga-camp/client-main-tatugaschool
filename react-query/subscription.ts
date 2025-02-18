import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateSubscriptionService,
  GetListSubscriptionService,
  GetManageSubscriptionService,
  RequestCreateSubscriptionService,
  RequestGetManageSubscriptionService,
} from "../services";

export function useCreateSubscription() {
  return useMutation({
    mutationKey: ["create-subscription"],
    mutationFn: (request: RequestCreateSubscriptionService) =>
      CreateSubscriptionService(request),
  });
}

export function useManageSubscription() {
  return useMutation({
    mutationKey: ["manage-subscription"],
    mutationFn: (request: RequestGetManageSubscriptionService) =>
      GetManageSubscriptionService(request),
  });
}

export function useGetListSubscription() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => GetListSubscriptionService(),
  });
}
