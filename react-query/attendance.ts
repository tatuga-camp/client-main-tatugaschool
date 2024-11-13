import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateAttendanceRowService,
  CreateAttendanceTableService,
  GetAttendanceRowByTabelIdService,
  GetAttendanceTablesService,
  RequestCreateAttendanceRowService,
  RequestCreateAttendanceTableService,
  RequestUpdateAttendanceRowService,
  RequestUpdateAttendanceService,
  RequestUpdateManyAttendanceService,
  UpdateAttendanceRowService,
  UpdateAttendanceService,
  UpdateManyAttendanceService,
} from "../services";
import { Attendance, AttendanceRow, AttendanceTable } from "../interfaces";

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

export function useUpdateManyAttendance() {
  return useMutation({
    mutationKey: ["update-many-attendance"],
    mutationFn: (request: {
      request: RequestUpdateManyAttendanceService;
      queryClient: QueryClient;
    }) => UpdateManyAttendanceService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-rows", { attendanceTableId: data[0].attendanceTableId }],
        (oldData: (AttendanceRow & { attendances: Attendance[] })[]) => {
          return oldData?.map((attendanceRow) => {
            const attendanceWIthRowIds = data.filter(
              (a) => a.attendanceRowId === attendanceRow.id
            );
            if (attendanceWIthRowIds.length > 0) {
              return {
                ...attendanceRow,
                attendances: attendanceRow.attendances.map((attendance) => {
                  const updatedAttendance = attendanceWIthRowIds.find(
                    (a) => a.id === attendance.id
                  );
                  if (updatedAttendance) {
                    return updatedAttendance;
                  }
                  return attendance;
                }),
              };
            } else {
              return attendanceRow;
            }
          });
        }
      );
    },
  });
}
export function useUpdateRowAttendance() {
  return useMutation({
    mutationKey: ["update-row-attendance"],
    mutationFn: (request: {
      request: RequestUpdateAttendanceRowService;
      queryClient: QueryClient;
    }) => UpdateAttendanceRowService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-rows", { attendanceTableId: data.attendanceTableId }],
        (oldData: (AttendanceRow & { attendances: Attendance[] })[]) => {
          return oldData?.map((attendanceRow) => {
            if (attendanceRow.id === data.id) {
              return {
                ...data,
                attendances: attendanceRow.attendances,
              };
            }
            return attendanceRow;
          });
        }
      );
    },
  });
}

export function useCreateAttendanceTable() {
  return useMutation({
    mutationKey: ["create-attendance-table"],
    mutationFn: (request: {
      request: RequestCreateAttendanceTableService;
      queryClient: QueryClient;
    }) => CreateAttendanceTableService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-tables", { subjectId: data.subjectId }],
        (oldData: AttendanceTable[]) => {
          return [...(oldData ?? []), data];
        }
      );
    },
  });
}
