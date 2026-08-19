import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ApplyDiscountService,
  CreateSubscriptionService,
  GetListSubscriptionService,
  GetManageSubscriptionService,
  RenewalPreviewService,
  RenewSubscriptionService,
  RequestApplyDiscountService,
  RequestCreateSubscriptionService,
  RequestGetManageSubscriptionService,
  RequestRenewalService,
  RequestUpgradeService,
  RequestValidateDiscountService,
  UpgradePreviewService,
  UpgradeSubscriptionService,
  ValidateDiscountService,
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

export function useValidateDiscount() {
  return useMutation({
    mutationKey: ["validate-discount"],
    mutationFn: (request: RequestValidateDiscountService) =>
      ValidateDiscountService(request),
  });
}

export function useApplyDiscount() {
  return useMutation({
    mutationKey: ["apply-discount"],
    mutationFn: (request: RequestApplyDiscountService) =>
      ApplyDiscountService(request),
  });
}

export function useUpgradePreview() {
  return useMutation({
    mutationKey: ["upgrade-preview"],
    mutationFn: (request: RequestUpgradeService) =>
      UpgradePreviewService(request),
  });
}

export function useUpgradeSubscription() {
  return useMutation({
    mutationKey: ["upgrade-subscription"],
    mutationFn: (request: RequestUpgradeService) =>
      UpgradeSubscriptionService(request),
  });
}

export function useRenewalPreview() {
  return useMutation({
    mutationKey: ["renewal-preview"],
    mutationFn: (request: RequestRenewalService) =>
      RenewalPreviewService(request),
  });
}

export function useRenewSubscription() {
  return useMutation({
    mutationKey: ["renew-subscription"],
    mutationFn: (request: RequestRenewalService) =>
      RenewSubscriptionService(request),
  });
}
