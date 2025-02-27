import { useQuery } from "@tanstack/react-query";
import { GetSuggestCareerService } from "../services/career";

export function useGetCareerSuggestion(request: { studentId: string }) {
  return useQuery({
    queryKey: ["career-suggest", { studentId: request.studentId }],
    queryFn: () => GetSuggestCareerService(request),
  });
}
