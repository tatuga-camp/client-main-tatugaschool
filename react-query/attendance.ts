import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetAttendanceTablesService } from "../services";

export function useGetAttendancesTable({ subjectId }: { subjectId: string }) {
  return useQuery({
    queryKey: ["attendance-tables", { subjectId: subjectId }],
    queryFn: () => GetAttendanceTablesService({ subjectId }),
  });
}
