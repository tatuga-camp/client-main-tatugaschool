import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SchoolAnalytics } from "../interfaces";
import {
  GetSchoolAnalyticsService,
  GetStudentInsightDetailService,
} from "../services/analytics";

export function useGetSchoolAnalytics({
  schoolId,
  educationYear,
}: {
  schoolId: string;
  educationYear?: string;
}): UseQueryResult<SchoolAnalytics, Error> {
  return useQuery({
    queryKey: ["school-analytics", { schoolId, educationYear }],
    queryFn: () =>
      GetSchoolAnalyticsService({
        schoolId,
        educationYear: educationYear as string,
      }),
    enabled: !!educationYear,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetStudentInsightDetail({
  schoolId,
  studentId,
  educationYear,
  enabled,
}: {
  schoolId: string;
  studentId: string;
  educationYear?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["student-insight", { schoolId, studentId, educationYear }],
    queryFn: () =>
      GetStudentInsightDetailService({
        schoolId,
        studentId,
        educationYear: educationYear as string,
      }),
    enabled: enabled && !!educationYear,
    staleTime: 1000 * 60 * 5,
  });
}
