import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateAttendanceRowService,
  GetAttendanceRowByTabelIdService,
  GetAttendanceTablesService,
  RequestCreateAttendanceRowService,
  RequestUpdateAttendanceService,
  UpdateAttendanceService,
} from "../services";
import { Attendance, AttendanceRow } from "../interfaces";

export function useGetAttendancesTable({ subjectId }: { subjectId: string }) {
  return useQuery({
    queryKey: ["attendance-tables", { subjectId: subjectId }],
    queryFn: () => GetAttendanceTablesService({ subjectId }),
  });
}

export function useGetAttendanceRowByTableId({
  attendanceTableId,
}: {
  attendanceTableId: string;
}) {
  return useQuery({
    queryKey: ["attendance-rows", { attendanceTableId: attendanceTableId }],
    queryFn: () => GetAttendanceRowByTabelIdService({ attendanceTableId }),
  });
}

export function useCreateAttendanceRow() {
  return useMutation({
    mutationKey: ["create-attendance-row"],
    mutationFn: (request: {
      request: RequestCreateAttendanceRowService;
      queryClient: QueryClient;
    }) => CreateAttendanceRowService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData<
        (AttendanceRow & { attendances: Attendance[] })[]
      >(
        ["attendance-rows", { attendanceTableId: data.attendanceTableId }],
        (
          oldData: (AttendanceRow & { attendances: Attendance[] })[] | undefined
        ) => {
          return [
            ...(oldData ?? []),
            {
              ...data,
            },
          ];
        }
      );
    },
  });
}

export function useUpdateAttendance() {
  return useMutation({
    mutationKey: ["update-attendance"],
    mutationFn: (request: {
      request: RequestUpdateAttendanceService;
      queryClient: QueryClient;
    }) => UpdateAttendanceService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-rows", { attendanceTableId: data.attendanceTableId }],
        (oldData: (AttendanceRow & { attendances: Attendance[] })[]) => {
          return oldData?.map((attendanceRow) => {
            if (attendanceRow.id === data.attendanceRowId) {
              return {
                ...attendanceRow,
                attendances: attendanceRow.attendances.map((attendance) => {
                  if (attendance.id === data.id) {
                    return data;
                  }
                  return attendance;
                }),
              };
            }
            return attendanceRow;
          });
        }
      );
    },
  });
}
