import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateAttendanceRowService,
  CreateAttendanceService,
  CreateAttendanceStatusListService,
  CreateAttendanceTableService,
  DeleteAttendanceRowService,
  DeleteAttendanceStatusListService,
  GetAttendanceRowByTabelIdService,
  GetAttendanceTablesService,
  RequestCreateAttendanceRowService,
  RequestCreateAttendanceService,
  RequestCreateAttendanceStatusListService,
  RequestCreateAttendanceTableService,
  RequestDeleteAttendanceRowService,
  RequestDeleteAttendanceStatusListService,
  RequestUpdateAttendanceRowService,
  RequestUpdateAttendanceService,
  RequestUpdateAttendanceStatusListService,
  RequestUpdateManyAttendanceService,
  UpdateAttendanceRowService,
  UpdateAttendanceService,
  UpdateAttendanceStatusListService,
  UpdateAttendanceTableService,
  UpdateManyAttendanceService,
} from "../services";
import { Attendance, AttendanceRow, AttendanceTable } from "../interfaces";
import {
  DeleteAttendanceTableService,
  RequestDeleteAttendanceTableService,
  RequestUpdateAttendanceTableService,
  ResponseGetAttendanceTablesService,
} from "../services/attendance-table";

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
    refetchInterval: 1000 * 5,
    refetchOnWindowFocus: true, // Disables automatic refetching when browser window is focused.
  });
}

export function useCreateAttendanceRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-attendance-row"],
    mutationFn: (request: { request: RequestCreateAttendanceRowService }) =>
      CreateAttendanceRowService(request.request),
    async onSuccess(data, variables, context) {
      const oldData = queryClient.getQueryData([
        "attendance-rows",
        { attendanceTableId: data.attendanceTableId },
      ]);
      if (!oldData) {
        await queryClient.prefetchQuery({
          queryKey: [
            "attendance-rows",
            { attendanceTableId: data.attendanceTableId },
          ],
          queryFn: () =>
            GetAttendanceRowByTabelIdService({
              attendanceTableId: data.attendanceTableId,
            }),
        });
      } else {
        queryClient.setQueryData<
          (AttendanceRow & { attendances: Attendance[] })[]
        >(
          ["attendance-rows", { attendanceTableId: data.attendanceTableId }],
          (
            oldData:
              | (AttendanceRow & { attendances: Attendance[] })[]
              | undefined,
          ) => {
            return [
              ...(oldData ?? []),
              {
                ...data,
              },
            ];
          },
        );
      }
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
    async onSuccess(data, variables, context) {
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
        },
      );
    },
  });
}

export function useCreateAttendance() {
  return useMutation({
    mutationKey: ["create-attendance"],
    mutationFn: (request: {
      request: RequestCreateAttendanceService;
      queryClient: QueryClient;
    }) => CreateAttendanceService(request.request),
    async onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-rows", { attendanceTableId: data.attendanceTableId }],
        (oldData: (AttendanceRow & { attendances: Attendance[] })[]) => {
          return oldData?.map((attendanceRow) => {
            if (attendanceRow.id === data.attendanceRowId) {
              return {
                ...attendanceRow,
                attendances: [...attendanceRow.attendances, data],
              };
            }
            return attendanceRow;
          });
        },
      );
    },
  });
}

export function useUpdateManyAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-many-attendance"],
    mutationFn: (request: { request: RequestUpdateManyAttendanceService }) =>
      UpdateManyAttendanceService(request.request),
    onSuccess(data, variables, context) {
      if (data.length > 0) {
        queryClient.setQueryData(
          ["attendance-rows", { attendanceTableId: data[0].attendanceTableId }],
          (oldData: (AttendanceRow & { attendances: Attendance[] })[]) => {
            return oldData?.map((attendanceRow) => {
              const attendanceWIthRowIds = data.filter(
                (a) => a.attendanceRowId === attendanceRow.id,
              );
              if (attendanceWIthRowIds.length > 0) {
                return {
                  ...attendanceRow,
                  attendances: attendanceRow.attendances.map((attendance) => {
                    const updatedAttendance = attendanceWIthRowIds.find(
                      (a) => a.id === attendance.id,
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
          },
        );
      }
    },
  });
}
export function useUpdateRowAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-row-attendance"],
    mutationFn: (request: RequestUpdateAttendanceRowService) =>
      UpdateAttendanceRowService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
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
        },
      );
    },
  });
}

export function useDeleteRowAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-row-attendance"],
    mutationFn: (request: RequestDeleteAttendanceRowService) =>
      DeleteAttendanceRowService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["attendance-rows", { attendanceTableId: data.attendanceTableId }],
        (oldData: (AttendanceRow & { attendances: Attendance[] })[]) => {
          return oldData.filter((row) => row.id !== data.id);
        },
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
        (oldData: ResponseGetAttendanceTablesService) => {
          return [...(oldData ?? []), data];
        },
      );
    },
  });
}

export function useDeleteAttendanceTable() {
  return useMutation({
    mutationKey: ["delete-attendance-table"],
    mutationFn: (request: {
      request: RequestDeleteAttendanceTableService;
      queryClient: QueryClient;
    }) => DeleteAttendanceTableService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-tables", { subjectId: data.subjectId }],
        (oldData: ResponseGetAttendanceTablesService) => {
          return oldData?.filter((table) => table.id !== data.id);
        },
      );
    },
  });
}

export function useUpdateAttendanceTable() {
  return useMutation({
    mutationKey: ["update-attendance-table"],
    mutationFn: (request: {
      request: RequestUpdateAttendanceTableService;
      queryClient: QueryClient;
    }) => UpdateAttendanceTableService(request.request),
    onSuccess(data, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-tables", { subjectId: data.subjectId }],
        (oldData: ResponseGetAttendanceTablesService) => {
          return oldData?.map((table) => {
            if (table.id === data.id) {
              return {
                ...data,
                statusLists: table.statusLists,
              };
            }
            return table;
          });
        },
      );
    },
  });
}

export function useUpdateAttendanceStatus() {
  return useMutation({
    mutationKey: ["update-attendance-status"],
    mutationFn: (request: {
      request: RequestUpdateAttendanceStatusListService;
      queryClient: QueryClient;
    }) => UpdateAttendanceStatusListService(request.request),
    onSuccess(status, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-tables", { subjectId: status.subjectId }],
        (oldData: ResponseGetAttendanceTablesService) => {
          return oldData?.map((table) => {
            if (table.id === status.attendanceTableId) {
              return {
                ...table,
                statusLists: table.statusLists.map((oldStatus) => {
                  if (oldStatus.id === status.id) {
                    return status;
                  }
                  return oldStatus;
                }),
              };
            }
            return table;
          });
        },
      );
    },
  });
}

export function useCreateAttendanceStatus() {
  return useMutation({
    mutationKey: ["create-attendance-status"],
    mutationFn: (request: {
      request: RequestCreateAttendanceStatusListService;
      queryClient: QueryClient;
    }) => CreateAttendanceStatusListService(request.request),
    async onSuccess(status, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-tables", { subjectId: status.subjectId }],
        (oldData: ResponseGetAttendanceTablesService) => {
          return oldData?.map((table) => {
            if (table.id === status.attendanceTableId) {
              return {
                ...table,
                statusLists: [...table.statusLists, status],
              };
            }
            return table;
          });
        },
      );
    },
  });
}

export function useDeleteAttendanceStatus() {
  return useMutation({
    mutationKey: ["delete-attendance-status"],
    mutationFn: (request: {
      request: RequestDeleteAttendanceStatusListService;
      queryClient: QueryClient;
    }) => DeleteAttendanceStatusListService(request.request),
    async onSuccess(status, variables, context) {
      variables.queryClient.setQueryData(
        ["attendance-tables", { subjectId: status.subjectId }],
        (oldData: ResponseGetAttendanceTablesService) => {
          return oldData?.map((table) => {
            if (table.id === status.attendanceTableId) {
              return {
                ...table,
                statusLists: table.statusLists.filter(
                  (s) => s.id !== status.id,
                ),
              };
            }
            return table;
          });
        },
      );
    },
  });
}
