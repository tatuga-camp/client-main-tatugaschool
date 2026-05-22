import { useQuery } from "@tanstack/react-query";
import { GetAnnouncementsService } from "../services/announcement";

export function useGetAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => GetAnnouncementsService(),
  });
}
