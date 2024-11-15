import React, { memo, useEffect } from "react";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
} from "../../interfaces";
import {
  useCreateAttendanceStatus,
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
};
function AttendanceTableSetting({ table, toast }: Props) {
  const queryClient = useQueryClient();
  const [tableData, setTableData] = React.useState<
    AttendanceTable & { statusLists: AttendanceStatusList[] }
  >(table);
  const updateTable = useUpdateAttendanceTable();
  const updateStatus = useUpdateAttendanceStatus();

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
            title: tableData.title,
            description: tableData.description,
          },
        },
        queryClient,
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
      summary: "Updated",
      detail: "Attendance Table Updated",
    });
  };

  return (
    <div>
      <h1 className="text-xl font-medium">General Settings</h1>
      <h4 className="text-sm text-gray-500">Manage your general settings</h4>
      <form
        onSubmit={handleUpdate}
        className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5"
      >
        <div className="border-b w-full justify-between text-lg font-medium py-3">
          Subject Infomation
        </div>
        <div className="grid grid-cols-1 w-full">
          <div className="grid grid-cols-1   gap-5  p-2 py-4">
            <label className="w-full items-center grid grid-cols-2 gap-10">
              <span className="text-base text-black">Table Name:</span>
              <input
                required
                type="text"
                maxLength={99}
                value={tableData?.title}
                onChange={(e) => {
                  setTableData((prev) => {
                    return {
                      ...prev,
                      title: e.target.value,
                    };
                  });
                }}
                placeholder="Table Name"
                className="main-input"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 bg-gray-200/20   gap-5  p-2 py-4">
            <label className="w-full items-center grid grid-cols-2 gap-10">
              <span className="text-base text-black">Description:</span>
              <input
                required
                type="text"
                maxLength={99}
                value={tableData?.description}
                onChange={(e) => {
                  setTableData((prev) => {
                    return {
                      ...prev,
                      description: e.target.value,
                    };
                  });
                }}
                placeholder="Description"
                className="main-input"
              />
            </label>
          </div>
        </div>
        <button
          disabled={updateTable.isPending}
          className="main-button flex justify-center items-center  w-40 mt-5"
        >
          {updateTable.isPending ? (
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="w-5 h-5"
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

      <h1 className="text-xl mt-10 font-medium">Attendance Status</h1>
      <h4 className="text-sm text-gray-500">
        Customize your attendance status here
      </h4>

      <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
        <div className="border-b w-full flex justify-between  text-lg font-medium py-3">
          Attendance Status
          {updateStatus.isPending && (
            <div>
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="w-5 h-5"
                strokeWidth="8"
              />
            </div>
          )}
        </div>
        <div className="w-full max-h-[35rem] overflow-auto">
          <table className="table-fixed w-full">
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
              {tableData.statusLists.map((status, index) => {
                const odd = index % 2 === 0;
                return (
                  <>
                    <AttendanceStatusRow
                      updateStatus={updateStatus}
                      key={index}
                      odd={odd}
                      status={status}
                    />
                    {tableData.statusLists.length - 1 === index && (
                      <CreateAttendanceStatus
                        odd={!odd}
                        attendanceTableId={table.id}
                        key={index + 1}
                        toast={toast}
                      />
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
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
  }: {
    status: AttendanceStatusList;
    odd: boolean;
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
    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

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
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(async () => {
        await updateStatus.mutateAsync({
          request: {
            query: {
              id: status.id,
            },
            body: {
              [name]: value,
            },
          },
          queryClient: queryClient,
        });
        debounceTimeout.current = null; // Reset timeout reference
      }, 1000);
    };
    return (
      <tr
        className={`${
          odd ? "bg-white" : "bg-gray-50"
        } relative border-spacing-2 border-4 border-transparent`}
      >
        <td>
          <div className="w-full p-2 rounded-md text-center">{data.title}</div>
          {data.isHidden && (
            <div className="w-full absolute top-0 bottom-0 m-auto h-[1px] bg-black"></div>
          )}
        </td>
        <td>
          <div className="w-full flex items-center justify-center">
            <label
              htmlFor={`hs-color-input-${data.id}`}
              style={{
                backgroundColor: `${data.color}`,
              }}
              className="w-max p-2 rounded-md text-center cursor-pointer active:scale-105 transition"
            >
              {data.color}
            </label>
            <input
              type="color"
              id={`hs-color-input-${data.id}`}
              disabled={data.isHidden}
              className="w-0 h-0"
              required
              value={data.color}
              onChange={(e) => {
                handleChange({ name: "color", value: e.target.value });
              }}
            />
          </div>
        </td>
        <td>
          <div className="w-full flex items-center justify-center">
            <div className="w-20 flex items-center justify-center">
              <InputNumber
                value={data.value}
                max={10}
                min={-1}
                onValueChange={(data) =>
                  handleChange({ name: "value", value: data })
                }
                disabled={data.isHidden}
              />
            </div>
          </div>
        </td>
        <td>
          <div className="w-full flex items-center justify-center">
            <button
              onClick={() => {
                handleChange({ name: "isHidden", value: !data.isHidden });
              }}
              className={`${data.isHidden ? "reject-button" : "main-button"}`}
            >
              {data.isHidden ? (
                <div className="flex items-center justify-center gap-1">
                  <FaRegEyeSlash />
                  Invisible
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <FaRegEye /> Visible
                </div>
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  }
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
        }   gap-5  p-2 py-4 relative border-spacing-2 border-4 border-transparent`}
      >
        <td>
          <div className="w-full p-2 rounded-md text-center">
            <input
              type="text"
              className="main-input"
              maxLength={20}
              required
              value={createData.title}
              onChange={(e) => {
                setCreateData((prev) => {
                  return {
                    ...prev,
                    title: e.target.value,
                  };
                });
              }}
            />
          </div>
        </td>
        <td>
          <div className="w-full  flex items-center justify-center">
            <label
              htmlFor="hs-color-input"
              style={{
                backgroundColor: `${createData.color}`,
              }}
              className="w-max p-2 rounded-md text-center cursor-pointer active:scale-105 transition"
            >
              {createData.color}
            </label>
            <input
              type="color"
              id="hs-color-input"
              className="w-0 h-0"
              required
              value={createData.color}
              onChange={(e) => {
                setCreateData((prev) => {
                  return {
                    ...prev,
                    color: e.target.value,
                  };
                });
              }}
            />
          </div>
        </td>
        <td>
          <div className="w-full flex items-center justify-center">
            <div className="w-20 flex items-center justify-center">
              <InputNumber
                required
                value={createData.value}
                max={10}
                min={-1}
                onValueChange={(data) => {
                  setCreateData((prev) => {
                    return { ...prev, value: data };
                  });
                }}
              />
            </div>
          </div>
        </td>
        <td>
          <div className="w-full flex items-center justify-center">
            <button
              disabled={create.isPending}
              onClick={handleCreate}
              className="main-button flex justify-center items-center"
            >
              {create.isPending ? (
                <ProgressSpinner
                  animationDuration="1s"
                  style={{ width: "20px" }}
                  className="w-5 h-5"
                  strokeWidth="8"
                />
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <CiSaveDown2 />
                  Create
                </div>
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  }
);
CreateAttendanceStatus.displayName = "CreateAttendanceStatus";
