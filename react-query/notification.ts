import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetUnreadNotificationService,
  MarkAllAsReadNotificationService,
  MarkAsReadNotificationService,
  RequestMarkAsReadNotificationService,
} from "../services";

export function useGetNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => GetUnreadNotificationService(),
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

export function useMarkAllAsReadNotifications() {
  return useMutation({
    mutationKey: ["mark-all-as-read-notifications"],
    mutationFn: () => MarkAllAsReadNotificationService(),
  });
}

export function useMarkAsReadNotification() {
  return useMutation({
    mutationKey: ["mark-as-read-notification"],
    mutationFn: (request: RequestMarkAsReadNotificationService) =>
      MarkAsReadNotificationService(request),
  });
}
