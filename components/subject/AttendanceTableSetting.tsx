import React, { memo, useEffect } from "react";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
} from "../../interfaces";
import {
  useCreateAttendanceStatus,
  useDeleteAttendanceStatus,
  useDeleteAttendanceTable,
  useUpdateAttendanceStatus,
  useUpdateAttendanceTable,
} from "../../react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveDown2 } from "react-icons/ci";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import {
  QueryClient,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { BiUserPin } from "react-icons/bi";
import { IoMdColorFilter } from "react-icons/io";
import { RxValue } from "react-icons/rx";
import { GrStatusCriticalSmall } from "react-icons/gr";
import InputNumber from "../common/InputNumber";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { RequestUpdateAttendanceStatusListService } from "../../services";

type Props = {
  table: AttendanceTable & { statusLists: AttendanceStatusList[] };
  toast: React.RefObject<Toast>;
  onDelete: () => void;
};
function AttendanceTableSetting({ table, toast, onDelete }: Props) {
  const queryClient = useQueryClient();
  const [tableData, setTableData] = React.useState<
    (AttendanceTable & { statusLists: AttendanceStatusList[] }) | undefined
  >();
  const updateTable = useUpdateAttendanceTable();
  const updateStatus = useUpdateAttendanceStatus();
  const deleteAttendanceTable = useDeleteAttendanceTable();

  useEffect(() => {
    setTableData(table);
  }, [table]);

  const handleUpdate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await updateTable.mutateAsync({
        request: {
          query: {
            attendanceTableId: table.id,
          },
          body: {
            title: tableData?.title,
            description: tableData?.description,
          },
        },
        queryClient,
      });
      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Attendance Table Updated",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleDeleteAttendanceTable = async ({
    attendanceTableId,
  }: {
    attendanceTableId: string;
  }) => {
    const replacedText = "DELETE";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>To confirm, type <strong>" +
      replacedText +
      "</strong> in the box below </div>";
    const { value } = await Swal.fire({
      title: "Are you sure?",
      input: "text",
      icon: "warning",
      footer: "This action is irreversible and destructive. Please be careful.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Deleting...",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteAttendanceTable.mutateAsync({
          request: {
            attendanceTableId,
          },
          queryClient,
        });
        onDelete();
        Swal.close();
        toast.current?.show({
          severity: "success",
          summary: "Deleted",
          detail: "Attendance Table Deleted",
        });
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something Went Wrong",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="">
      <h1 className="text-lg font-medium sm:text-xl">General Settings</h1>
      <h4 className="text-xs text-gray-500 sm:text-sm">
        Manage your general settings
      </h4>

      <form
        onSubmit={handleUpdate}
        className="mt-3 flex min-h-80 flex-col gap-3 rounded-md border bg-white p-2 sm:mt-5 sm:gap-5 sm:p-4"
      >
        <div className="w-full justify-between border-b py-2 text-base font-medium sm:py-3 sm:text-lg">
          Subject Information
        </div>
        <div className="grid w-full grid-cols-1">
          <div className="grid grid-cols-1 gap-3 p-2 py-3 sm:gap-5 sm:py-4">
            <label className="grid w-full grid-cols-1 items-start gap-2 sm:grid-cols-2 sm:items-center sm:gap-10">
              <span className="text-sm text-black sm:text-base">
                Table Name:
              </span>
              <input
                required
                type="text"
                maxLength={99}
                value={tableData?.title}
                onChange={(e) => {
                  setTableData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      title: e.target.value,
                    };
                  });
                }}
                placeholder="Table Name"
                className="main-input text-sm sm:text-base"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 bg-gray-200/20 p-2 py-3 sm:gap-5 sm:py-4">
            <label className="grid w-full grid-cols-1 items-start gap-2 sm:grid-cols-2 sm:items-center sm:gap-10">
              <span className="text-sm text-black sm:text-base">
                Description:
              </span>
              <input
                required
                type="text"
                maxLength={99}
                value={tableData?.description}
                onChange={(e) => {
                  setTableData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      description: e.target.value,
                    };
                  });
                }}
                placeholder="Description"
                className="main-input text-sm sm:text-base"
              />
            </label>
          </div>
        </div>
        <button
          disabled={updateTable.isPending}
          className="main-button mt-5 flex w-40 items-center justify-center"
        >
          {updateTable.isPending ? (
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="h-5 w-5"
              strokeWidth="8"
            />
          ) : (
            <div className="flex items-center justify-center gap-1">
              <CiSaveDown2 />
              Save Changes
            </div>
          )}
        </button>
      </form>

      <h1 className="mt-10 text-xl font-medium">Attendance Status</h1>
      <h4 className="text-sm text-gray-500">
        Customize your attendance status here
      </h4>

      <div className="mt-5 flex min-h-80 flex-col gap-5 rounded-md border bg-white p-4">
        <div className="flex w-full justify-between border-b py-3 text-lg font-medium">
          Attendance Status
          {updateStatus.isPending && (
            <div>
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="h-5 w-5"
                strokeWidth="8"
              />
            </div>
          )}
        </div>
        <div className="max-h-[35rem] w-full overflow-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th>
                  <div className="flex items-center justify-center gap-1">
                    <BiUserPin /> Name
                  </div>
                </th>
                <th>
                  <div className="flex items-center justify-center gap-1">
                    <IoMdColorFilter />
                    Color
                  </div>
                </th>
                <th>
                  <div className="flex items-center justify-center gap-1">
                    <RxValue />
                    Value
                  </div>
                </th>
                <th>
                  <div className="flex items-center justify-center gap-1">
                    <GrStatusCriticalSmall />
                    Status
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData?.statusLists.map((status, index) => {
                const odd = index % 2 === 0;
                return (
                  <>
                    <AttendanceStatusRow
                      toast={toast}
                      updateStatus={updateStatus}
                      key={index}
                      odd={odd}
                      status={status}
                    />
                  </>
                );
              })}
              <CreateAttendanceStatus
                odd={(tableData?.statusLists?.length ?? 0) % 2 === 0}
                attendanceTableId={table.id}
                toast={toast}
              />
            </tbody>
          </table>
        </div>
      </div>

      <h1 className="mt-10 text-xl font-medium">Danger zone</h1>
      <h4 className="text-sm text-gray-500">
        Irreversible and destructive actions
      </h4>
      <div className="mt-5 flex flex-col items-start gap-5 rounded-md border bg-white p-4">
        <h2 className="border-b py-3 text-lg font-medium">
          Delete This Attendance Table
        </h2>
        <h4 className="text-sm text-red-700">
          This action is irreversible and will delete all attendance data
          associated with this table. Cannot be undone.
        </h4>
        <button
          onClick={() =>
            handleDeleteAttendanceTable({ attendanceTableId: table.id })
          }
          className="reject-button mt-5"
        >
          Delete This Table
        </button>
      </div>
    </div>
  );
}

export default AttendanceTableSetting;

const AttendanceStatusRow = memo(
  ({
    status,
    odd,
    updateStatus,
    toast,
  }: {
    status: AttendanceStatusList;
    odd: boolean;
    toast: React.RefObject<Toast>;
    updateStatus: UseMutationResult<
      AttendanceStatusList,
      Error,
      {
        request: RequestUpdateAttendanceStatusListService;
        queryClient: QueryClient;
      },
      unknown
    >;
  }) => {
    const [data, setData] = React.useState<AttendanceStatusList>(status);
    const queryClient = useQueryClient();
    const deleteStatus = useDeleteAttendanceStatus();
    useEffect(() => {
      setData(status);
    }, [status]);

    const handleChange = async ({
      name,
      value,
    }: {
      name: string;
      value: any;
    }) => {
      setData((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    };

    const handleUpdate = async (
      e: React.FocusEvent<HTMLInputElement, Element>,
    ) => {
      try {
        const name = e.target.name as keyof AttendanceStatusList;
        if (data.title === "") {
          return;
        }
        if (data[name] === status[name]) {
          return;
        }
        await updateStatus.mutateAsync({
          request: {
            query: {
              id: status.id,
            },
            body: {
              title: data.title,
              color: data.color,
              value: data.value,
            },
          },
          queryClient: queryClient,
        });
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something Went Wrong",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    };

    const handleDelete = async () => {
      try {
        await deleteStatus.mutateAsync({
          request: {
            id: status.id,
          },
          queryClient,
        });
        toast.current?.show({
          severity: "success",
          summary: "Deleted",
          detail: "Attendance Status Deleted",
        });
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something Went Wrong",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    };

    return (
      <tr
        className={`${
          odd ? "bg-white" : "bg-gray-50"
        } relative border-spacing-2 border-4 border-transparent`}
      >
        <td className="p-2 sm:p-3">
          <input
            onBlur={handleUpdate}
            name="title"
            disabled={updateStatus.isPending}
            onChange={(e) => {
              handleChange({ name: "title", value: e.target.value });
            }}
            required
            value={data.title}
            className="bg-transparent text-center text-base focus:border-b focus:outline-none"
          />
        </td>
        <td className="p-2 sm:p-3">
          <div className="flex w-full items-center justify-center">
            <label
              htmlFor={`hs-color-input-${data.id}`}
              style={{
                backgroundColor: `${data.color}`,
              }}
              className="w-max cursor-pointer rounded-md p-1.5 text-center text-xs transition active:scale-105 sm:p-2 sm:text-sm"
            >
              {data.color}
            </label>
            <input
              onBlur={handleUpdate}
              type="color"
              id={`hs-color-input-${data.id}`}
              disabled={updateStatus.isPending}
              className="h-0 w-0"
              required
              name="color"
              value={data.color}
              onChange={(e) => {
                handleChange({ name: "color", value: e.target.value });
              }}
            />
          </div>
        </td>
        <td className="p-2 sm:p-3">
          <div className="flex w-full items-center justify-center">
            <div className="flex w-16 items-center justify-center sm:w-20">
              <InputNumber
                onBlur={handleUpdate}
                value={data.value}
                max={10}
                name="value"
                required
                disabled={updateStatus.isPending}
                onValueChange={() => {}}
                onChange={(data) =>
                  handleChange({ name: "value", value: data })
                }
              />
            </div>
          </div>
        </td>
        <td className="p-2 sm:p-3">
          <div className="flex w-full items-center justify-center">
            <button
              onClick={handleDelete}
              className="reject-button flex items-center justify-center px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
            >
              DELETE
            </button>
          </div>
        </td>
      </tr>
    );
  },
);
AttendanceStatusRow.displayName = "AttendanceStatusRow";

const CreateAttendanceStatus = memo(
  ({
    odd,
    toast,
    attendanceTableId,
  }: {
    odd: boolean;
    toast: React.RefObject<Toast>;
    attendanceTableId: string;
  }) => {
    const queryClient = useQueryClient();
    const create = useCreateAttendanceStatus();
    const [createData, setCreateData] = React.useState<{
      title?: string;
      color?: string;
      value?: number;
    }>({
      value: 1,
      color: "#e2eee2",
    });

    const handleCreate = async () => {
      try {
        if (!createData.title || !createData.color || !createData.value) {
          throw new Error("Title, Color and Value is required");
        }
        await create.mutateAsync({
          request: {
            title: createData.title,
            color: createData.color,
            value: createData.value,
            attendanceTableId: attendanceTableId,
          },
          queryClient,
        });
        setCreateData(() => {
          return {
            value: 1,
            color: "#e2eee2",
          };
        });
        show();
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something Went Wrong",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    };
    const show = () => {
      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Attendance Status Created",
      });
    };
    return (
      <tr
        className={`${
          odd ? "bg-white" : "bg-gray-50"
        } relative border-spacing-2 gap-3 border-4 border-transparent p-1 py-2 sm:gap-5 sm:p-2 sm:py-4`}
      >
        <td>
          <div className="w-full rounded-md p-1 text-center sm:p-2">
            <input
              type="text"
              className="main-input w-full text-sm sm:text-base"
              maxLength={20}
              required
              value={createData.title}
              onChange={(e) => {
                setCreateData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
              }}
            />
          </div>
        </td>
        <td>
          <div className="flex w-full items-center justify-center">
            <label
              htmlFor="hs-color-input"
              style={{ backgroundColor: createData.color }}
              className="w-max cursor-pointer rounded-md p-1 text-center text-xs transition active:scale-105 sm:p-2 sm:text-sm"
            >
              {createData.color}
            </label>
            <input
              type="color"
              id="hs-color-input"
              className="h-0 w-0"
              required
              value={createData.color}
              onChange={(e) => {
                setCreateData((prev) => ({
                  ...prev,
                  color: e.target.value,
                }));
              }}
            />
          </div>
        </td>
        <td>
          <div className="flex w-full items-center justify-center">
            <div className="flex w-16 items-center justify-center sm:w-20">
              <InputNumber
                required
                value={createData.value}
                max={10}
                onValueChange={(data) => {
                  setCreateData((prev) => ({ ...prev, value: data }));
                }}
              />
            </div>
          </div>
        </td>
        <td>
          <div className="flex w-full items-center justify-center">
            <button
              disabled={create.isPending}
              onClick={handleCreate}
              className="main-button flex items-center justify-center px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
            >
              {create.isPending ? (
                <ProgressSpinner
                  animationDuration="1s"
                  style={{ width: "16px" }}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  strokeWidth="8"
                />
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <CiSaveDown2 className="text-sm sm:text-base" />
                  <span>Create</span>
                </div>
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  },
);
CreateAttendanceStatus.displayName = "CreateAttendanceStatus";
