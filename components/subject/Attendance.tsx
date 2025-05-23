import React, { useEffect } from "react";
import {
  useGetAttendanceRowByTableId,
  useGetAttendancesTable,
  useGetStudentOnSubject,
} from "../../react-query";
import { SiMicrosoftexcel } from "react-icons/si";
import { BiCustomize } from "react-icons/bi";
import {
  Attendance as AttendanceType,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  StudentOnSubject,
  PartialExcept,
} from "../../interfaces";
import { FaUser } from "react-icons/fa6";
import Image from "next/image";
import {
  decodeBlurhashToCanvas,
  getRandomSlateShade,
  getSlateColorStyle,
} from "../../utils";
import { defaultBlurHash } from "../../data";
import { MdOutlineSpeakerNotes } from "react-icons/md";
import useClickOutside from "../../hook/useClickOutside";
import AttendanceView from "./AttendanceView";
import AttendanceRowView from "./AttendanceRowView";
import { CiViewTable } from "react-icons/ci";
import AttendanceTableCreate from "./AttendanceTableCreate";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import AttendanceTableSetting from "./AttendanceTableSetting";
import { RiTable3 } from "react-icons/ri";
import { Bs123, BsQrCode } from "react-icons/bs";
import PopupLayout from "../layout/PopupLayout";
import { ExportAttendanceService } from "@/services";
import LoadingSpinner from "../common/LoadingSpinner";

const menuAttendances = [
  {
    title: "Attendances",
    icon: <RiTable3 />,
  },
  {
    title: "Summary",
    icon: <Bs123 />,
  },
] as const;

type MenuAttendance = (typeof menuAttendances)[number]["title"];

export type SelectAttendance = PartialExcept<
  AttendanceType,
  "attendanceRowId"
> & {
  student: StudentOnSubject;
};
function Attendance({
  subjectId,
  toast,
}: {
  subjectId: string;
  toast: React.RefObject<Toast>;
}) {
  const [triggerCreateAttendanceTable, setTriggerCreateAttendanceTable] =
    React.useState(false);
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId,
  });
  const [triggerSetting, setTriggerSetting] = React.useState(false);
  const tables = useGetAttendancesTable({
    subjectId,
  });
  const [selectAttendance, setSelectAttendance] =
    React.useState<SelectAttendance | null>(null);
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
      })
    | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const [selectRow, setSelectRow] = React.useState<AttendanceRow | null>(null);

  useEffect(() => {
    if (!selectTable && tables.data) {
      setSelectTable(tables.data?.[0]);
    } else if (selectTable && tables.data) {
      const findTable = tables.data.find((t) => t.id === selectTable.id);
      if (!findTable) return;
      setSelectTable(findTable);
    }
  }, [tables.data]);

  const handleDolwnloadExcel = async () => {
    try {
      setLoading(true);
      const response = await ExportAttendanceService({ subjectId });
      const link = document.createElement("a");
      link.href = response;
      link.download = `attendance.xlsx`;
      link.click();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to download the file", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to download the file",
        life: 3000,
      });
    }
  };
  return (
    <>
      {selectAttendance && selectTable && (
        <PopupLayout onClose={() => setSelectAttendance(null)}>
          <div className="bg-white border rounded-md p-2">
            <AttendanceView
              toast={toast}
              selectAttendance={selectAttendance}
              attendanceTable={selectTable}
              onClose={() => {
                document.body.style.overflow = "auto";
                setSelectAttendance(null);
              }}
            />
          </div>
        </PopupLayout>
      )}

      {selectRow && (
        <PopupLayout onClose={() => setSelectRow(null)}>
          <AttendanceRowView
            toast={toast}
            selectRow={selectRow}
            onClose={() => {
              document.body.style.overflow = "auto";

              setSelectRow(null);
            }}
          />
        </PopupLayout>
      )}

      {triggerCreateAttendanceTable && (
        <PopupLayout onClose={() => setTriggerCreateAttendanceTable(false)}>
          <div className="bg-white w-96 p-2 rounded-md border">
            <AttendanceTableCreate
              toast={toast}
              subjectId={subjectId}
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreateAttendanceTable(false);
              }}
            />
          </div>
        </PopupLayout>
      )}

      <header className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto">
        <section className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Attendance Data
          </h1>
          <span className="text-gray-400 text-sm md:text-base">
            You can view the attendance data of this subject here.
          </span>
        </section>
        <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
          <button
            onClick={() => setTriggerCreateAttendanceTable(true)}
            className="main-button w-full h-8 xl:w-auto flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
          >
            <CiViewTable />
            Create Table
          </button>
          <button
            disabled={loading}
            onClick={handleDolwnloadExcel}
            className="main-button  w-28 h-8  flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SiMicrosoftexcel />
                Export
              </>
            )}
          </button>

          <button
            onClick={() => setTriggerSetting((prev) => !prev)}
            className="second-button w-full h-8 xl:w-52 flex items-center justify-center gap-1 py-1 border"
          >
            {triggerSetting ? (
              <div className="flex items-center justify-center gap-1">
                <CiViewTable />
                View Table
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <BiCustomize />
                Customize / Edit
              </div>
            )}
          </button>
        </section>
      </header>
      <div className="w-full md:max-w-screen-md xl:max-w-screen-lg mx-auto border-b pb-5 px-3 md:px-5">
        {tables.isLoading && (
          <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        )}
        <ul className="mt-5 flex items-center justify-start w-full overflow-x-auto gap-2">
          {tables.isLoading ? (
            <div>Loading..</div>
          ) : (
            tables.data?.map((table) => (
              <li
                onClick={() => setSelectTable(table)}
                key={table.id}
                className={`w-max min-w-40 rounded-md shrink-0 p-3 cursor-pointer ${
                  table.id === selectTable?.id
                    ? "border-primary-color gradient-bg text-white"
                    : "border bg-white  text-black"
                }`}
              >
                <h2 className="text-base font-semibold">{table.title}</h2>
                <p
                  className={`text-xs text-gray-400
                  ${
                    table.id === selectTable?.id
                      ? " text-white"
                      : " text-gray-400"
                  }
                  `}
                >
                  {table.description}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <main className="w-full mt-5 flex flex-col items-center md:px-0 md:max-w-screen-md xl:max-w-screen-lg mx-auto">
        <div className="w-full">
          {triggerSetting && selectTable ? (
            <div className="px-5">
              <AttendanceTableSetting
                table={selectTable}
                toast={toast}
                onDelete={() => setSelectTable(null)}
              />
            </div>
          ) : (
            selectTable && (
              <div className="w-full">
                <DisplayAttendanceTable
                  selectTable={selectTable}
                  setSelectRow={setSelectRow}
                  setSelectAttendance={setSelectAttendance}
                />
              </div>
            )
          )}
        </div>
      </main>
    </>
  );
}

export default Attendance;

type Props = {
  selectTable: AttendanceTable & {
    statusLists: AttendanceStatusList[];
  };
  setSelectRow: React.Dispatch<React.SetStateAction<AttendanceRow | null>>;
  setSelectAttendance: React.Dispatch<
    React.SetStateAction<SelectAttendance | null>
  >;
};
function DisplayAttendanceTable({
  selectTable,
  setSelectRow,
  setSelectAttendance,
}: Props) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [selectMenu, setSelectMenu] =
    React.useState<MenuAttendance>("Attendances");
  const rows = useGetAttendanceRowByTableId({
    attendanceTableId: selectTable.id,
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: selectTable.subjectId,
  });

  useEffect(() => {
    if (rows.isSuccess && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [rows.isSuccess]);

  return (
    <div className="w-full flex flex-col items-center">
      <ul className="w-full flex flex-col md:flex-row items-center justify-center gap-2">
        {menuAttendances.map((menu) => (
          <li key={menu.title} className="w-full md:w-auto">
            <button
              onClick={() => setSelectMenu(menu.title)}
              className={`border-b w-full md:w-52 p-2 rounded-md transition flex justify-start items-center gap-1
              ${
                menu.title === selectMenu
                  ? "border-primary-color text-primary-color bg-white drop-shadow"
                  : "border-gray-400"
              }`}
            >
              {menu.icon} {menu.title}
            </button>
          </li>
        ))}
      </ul>
      <div
        ref={scrollRef}
        className="w-full h-[30rem] overflow-auto relative bg-white rounded-md mt-5"
      >
        <table className="table-fixed bg-white md:min-w-[640px]">
          <thead className="">
            <tr className="border-b  bg-white sticky top-0 z-40">
              <th className="text-sm z-40 sticky left-0 bg-white font-semibold">
                <div className="w-48 md:w-96 flex justify-start items-center gap-2">
                  <FaUser />
                  Name
                </div>
              </th>
              {rows.isLoading
                ? [...Array(20)].map((_, index) => {
                    const number = getRandomSlateShade();
                    const color = getSlateColorStyle(number);
                    return (
                      <th key={index} className="text-sm  font-semibold">
                        <div
                          style={color}
                          className="w-40 h-14  animate-pulse"
                        ></div>
                      </th>
                    );
                  })
                : selectMenu === "Attendances"
                ? rows?.data
                    ?.sort(
                      (a, b) =>
                        new Date(a.startDate).getTime() -
                        new Date(b.startDate).getTime()
                    )
                    .map((row) => {
                      const dateFormat = new Date(
                        row.startDate
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                      const time = new Date(row.startDate).toLocaleTimeString(
                        undefined,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );
                      return (
                        <th key={row.id} className="text-sm  font-semibold">
                          <button
                            onClick={() => setSelectRow(row)}
                            className="w-max pr-14 p-2 relative active:bg-gray-200
               hover:bg-gray-100  hover:ring-1 flex items-start flex-col"
                          >
                            <div className="flex items-center justify-end gap-1 absolute  top-1 m-auto right-1 ">
                              {row?.note && (
                                <div className="w-5 h-5 bg-white  flex items-center justify-center   rounded-md border">
                                  <MdOutlineSpeakerNotes />
                                </div>
                              )}
                              {row.type === "SCAN" && (
                                <div className="w-5 h-5 bg-white  flex items-center justify-center  rounded-md border">
                                  <BsQrCode />
                                </div>
                              )}
                            </div>
                            <span>{dateFormat}</span>
                            <span className="text-xs text-gray-500">
                              {time}
                            </span>
                          </button>
                        </th>
                      );
                    })
                : selectTable.statusLists.map((status) => {
                    return (
                      <th key={status.id} className="text-sm  font-semibold">
                        <button
                          className="w-40 p-2 relative active:bg-gray-200
       hover:bg-gray-100  hover:ring-1 flex items-start flex-col"
                        >
                          <span>{status.title}</span>
                          <span className="text-xs text-gray-500">Total</span>
                        </button>
                      </th>
                    );
                  })}
            </tr>
          </thead>
          <tbody>
            {studentOnSubjects.data
              ?.filter((s) => s.isActive)
              ?.sort((a, b) => Number(a.number) - Number(b.number))
              ?.map((student, index) => {
                const odd = index % 2 === 0;
                return (
                  <tr
                    className={` ${
                      odd ? "bg-gray-200/20" : "bg-white"
                    } hover:bg-gray-200/40 group`}
                    key={student.id}
                  >
                    <td
                      className={`text-sm sticky left-0 z-30 font-semibold
            ${odd ? "bg-gray-100" : "bg-white"} group-hover:bg-gray-200
            `}
                    >
                      <div className="flex items-center h-14 gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 relative rounded-md ring-1 overflow-hidden">
                          <Image
                            src={student.photo}
                            alt={student.firstName}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            placeholder="blur"
                            blurDataURL={decodeBlurhashToCanvas(
                              student.blurHash ?? defaultBlurHash
                            )}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h1 className="text-xs md:text-sm font-semibold">
                            {student.firstName} {student.lastName}
                          </h1>
                          <p className="text-xs text-gray-500">
                            Number {student.number}
                          </p>
                        </div>
                      </div>
                    </td>
                    {rows.isLoading
                      ? [...Array(20)].map((_, index) => {
                          const number = getRandomSlateShade();
                          const color = getSlateColorStyle(number);
                          return (
                            <td key={index}>
                              <div
                                style={color}
                                className="flex w-full h-14 animate-pulse"
                              ></div>
                            </td>
                          );
                        })
                      : selectMenu === "Attendances"
                      ? rows?.data?.map((row, index) => {
                          const attendance = row.attendances.find(
                            (a) => a.studentOnSubjectId === student.id
                          );
                          if (!attendance)
                            return (
                              <td key={row.id}>
                                <button
                                  onClick={() => {
                                    setSelectAttendance(() => {
                                      return {
                                        attendanceRowId: row.id,
                                        student,
                                      };
                                    });
                                  }}
                                  className="flex w-full h-14
                   relative hover:ring-1  bg-black select-none
                    text-white ring-black hover:drop-shadow-md cursor-pointer   
                   items-center transition
                   justify-center flex-col"
                                >
                                  NO DATA
                                </button>
                              </td>
                            );
                          return (
                            <td
                              key={row.id + attendance.id}
                              className="text-sm  font-semibold"
                            >
                              <button
                                onClick={() => {
                                  setSelectAttendance(() => {
                                    return {
                                      ...attendance,
                                      student,
                                    };
                                  });
                                }}
                                style={{
                                  backgroundColor:
                                    selectTable?.statusLists.find(
                                      (s) => s.title === attendance?.status
                                    )?.color ?? "#94a3b8",
                                }}
                                className="flex w-full h-14
                   relative hover:ring-1  ring-black hover:drop-shadow-md cursor-pointer   
                   items-center transition
                   justify-center flex-col"
                              >
                                {attendance?.note && (
                                  <div
                                    className="w-5 h-5 bg-white absolute flex items-center justify-center top-2 m-auto right-2
                    rounded-full"
                                  >
                                    <MdOutlineSpeakerNotes />
                                  </div>
                                )}
                                <span>{attendance?.status}</span>
                              </button>
                            </td>
                          );
                        })
                      : selectTable.statusLists.map((status) => {
                          const attendances = rows.data
                            ?.map((row) => {
                              const attendances = row.attendances.filter(
                                (a) => a.studentOnSubjectId === student.id
                              );
                              return attendances;
                            })
                            .flat();

                          const total = attendances?.reduce((acc, curr) => {
                            if (curr.status === status.title) {
                              return acc + 1;
                            } else {
                              return acc;
                            }
                          }, 0);
                          return (
                            <td key={status.id}>
                              <div
                                style={{
                                  backgroundColor: `${status.color}`,
                                }}
                                className="flex w-full h-14
                   relative hover:ring-1  ring-black hover:drop-shadow-md cursor-pointer   
                   items-center transition
                   justify-center flex-col"
                              >
                                <span>{total}</span>
                              </div>
                            </td>
                          );
                        })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
