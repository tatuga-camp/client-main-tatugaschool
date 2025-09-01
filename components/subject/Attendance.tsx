import { ExportAttendanceService } from "@/services";
import Image from "next/image";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React, { useEffect, useState } from "react";
import { BiCustomize } from "react-icons/bi";
import { Bs123, BsQrCode } from "react-icons/bs";
import { CiViewTable } from "react-icons/ci";
import { FaUser } from "react-icons/fa6";
import { MdOutlineSpeakerNotes } from "react-icons/md";
import { RiTable3 } from "react-icons/ri";
import { SiMicrosoftexcel } from "react-icons/si";
import { defaultBlurHash } from "../../data";
import {
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  Attendance as AttendanceType,
  PartialExcept,
  StudentOnSubject,
} from "../../interfaces";
import {
  useGetAttendanceRowByTableId,
  useGetAttendancesTable,
  useGetLanguage,
  useGetStudentOnSubject,
} from "../../react-query";
import {
  decodeBlurhashToCanvas,
  getRandomSlateShade,
  getSlateColorStyle,
} from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layout/PopupLayout";
import AttendanceChecker from "./AttendanceChecker";
import AttendanceTableCreate from "./AttendanceTableCreate";
import AttendanceTableSetting from "./AttendanceTableSetting";
import AttendanceView from "./AttendanceView";
import { attendanceLanguageData } from "../../data/languages";
import AttendanceDowload from "./AttendanceDowload";

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
  const language = useGetLanguage();
  const [triggerCreateAttendanceTable, setTriggerCreateAttendanceTable] =
    React.useState(false);
  const [triggerSetting, setTriggerSetting] = React.useState(false);
  const tables = useGetAttendancesTable({
    subjectId,
  });
  const [triggerAttendanceDowload, setTriggerAttendanceDowload] =
    useState(false);
  const [selectAttendance, setSelectAttendance] =
    React.useState<SelectAttendance | null>(null);
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
      })
    | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const [selectRow, setSelectRow] = React.useState<
    (AttendanceRow & { attendances: AttendanceType[] }) | null
  >(null);

  useEffect(() => {
    if (!selectTable && tables.data) {
      setSelectTable(tables.data?.[0]);
    } else if (selectTable && tables.data) {
      const findTable = tables.data.find((t) => t.id === selectTable.id);
      if (!findTable) return;
      setSelectTable(findTable);
    }
  }, [tables.data]);

  return (
    <>
      {selectAttendance && selectTable && (
        <PopupLayout onClose={() => setSelectAttendance(null)}>
          <div className="rounded-md border bg-white p-2">
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
          <AttendanceChecker
            subjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setSelectRow(null);
            }}
            selectAttendanceRow={selectRow}
            toast={toast}
          />
        </PopupLayout>
      )}
      {triggerAttendanceDowload && (
        <PopupLayout onClose={() => setTriggerAttendanceDowload(false)}>
          <AttendanceDowload
            toast={toast}
            subjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerAttendanceDowload(false);
            }}
          />
        </PopupLayout>
      )}

      {triggerCreateAttendanceTable && (
        <PopupLayout onClose={() => setTriggerCreateAttendanceTable(false)}>
          <div className="w-96 rounded-md border bg-white p-2">
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

      <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:gap-0 md:px-5 xl:max-w-screen-lg">
        <section className="text-center md:text-left">
          <h1 className="text-2xl font-semibold md:text-3xl">
            {attendanceLanguageData.title(language.data ?? "en")}
          </h1>
          <span className="text-sm text-gray-400 md:text-base">
            {attendanceLanguageData.description(language.data ?? "en")}
          </span>
        </section>
        <section className="flex flex-col items-center gap-2 md:gap-1 xl:flex-row">
          <button
            onClick={() => setTriggerCreateAttendanceTable(true)}
            className="main-button flex h-8 w-full items-center justify-center gap-1 py-1 ring-1 ring-blue-600 xl:w-auto"
          >
            <CiViewTable />
            {attendanceLanguageData.create(language.data ?? "en")}
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setTriggerAttendanceDowload(true);
            }}
            className="main-button flex h-8 w-40 items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SiMicrosoftexcel />
                {attendanceLanguageData.export(language.data ?? "en")}
              </>
            )}
          </button>

          <button
            onClick={() => setTriggerSetting((prev) => !prev)}
            className="second-button flex h-8 w-full items-center justify-center gap-1 border py-1 xl:w-52"
          >
            {triggerSetting ? (
              <div className="flex items-center justify-center gap-1">
                <CiViewTable />
                {attendanceLanguageData.view(language.data ?? "en")}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <BiCustomize />
                {attendanceLanguageData.edit(language.data ?? "en")}
              </div>
            )}
          </button>
        </section>
      </header>
      <div className="mx-auto w-full border-b px-3 pb-5 md:max-w-screen-md md:px-5 xl:max-w-screen-lg">
        {tables.isLoading && (
          <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        )}
        <ul className="mt-5 flex w-full items-center justify-start gap-2 overflow-x-auto">
          {tables.isLoading ? (
            <div>Loading..</div>
          ) : (
            tables.data?.map((table) => (
              <li
                onClick={() => setSelectTable(table)}
                key={table.id}
                className={`w-max min-w-40 shrink-0 cursor-pointer rounded-md p-3 ${
                  table.id === selectTable?.id
                    ? "gradient-bg border-primary-color text-white"
                    : "border bg-white text-black"
                }`}
              >
                <h2 className="text-base font-semibold">{table.title}</h2>
                <p
                  className={`text-xs text-gray-400 ${
                    table.id === selectTable?.id
                      ? "text-white"
                      : "text-gray-400"
                  } `}
                >
                  {table.description}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <main className="mx-auto mt-5 flex w-full flex-col items-center md:max-w-screen-md md:px-0 xl:max-w-screen-lg">
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
  setSelectRow: React.Dispatch<
    React.SetStateAction<
      (AttendanceRow & { attendances: AttendanceType[] }) | null
    >
  >;
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
    <div className="flex w-full flex-col items-center">
      <ul className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
        {menuAttendances.map((menu) => (
          <li key={menu.title} className="w-full md:w-auto">
            <button
              onClick={() => setSelectMenu(menu.title)}
              className={`flex w-full items-center justify-start gap-1 rounded-md border-b p-2 transition md:w-52 ${
                menu.title === selectMenu
                  ? "border-primary-color bg-white text-primary-color drop-shadow"
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
        className="relative mt-5 h-[30rem] w-full overflow-auto rounded-md bg-white"
      >
        <table className="table-fixed bg-white md:min-w-[640px]">
          <thead className="">
            <tr className="sticky top-0 z-40 border-b bg-white">
              <th className="sticky left-0 z-40 bg-white text-sm font-semibold">
                <div className="flex w-48 items-center justify-start gap-2 md:w-96">
                  <FaUser />
                  Name
                </div>
              </th>
              {rows.isLoading
                ? [...Array(20)].map((_, index) => {
                    const number = getRandomSlateShade();
                    const color = getSlateColorStyle(number);
                    return (
                      <th key={index} className="text-sm font-semibold">
                        <div
                          style={color}
                          className="h-14 w-40 animate-pulse"
                        ></div>
                      </th>
                    );
                  })
                : selectMenu === "Attendances"
                  ? rows?.data
                      ?.sort(
                        (a, b) =>
                          new Date(a.startDate).getTime() -
                          new Date(b.startDate).getTime(),
                      )
                      .map((row) => {
                        const dateFormat = new Date(
                          row.startDate,
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
                          },
                        );
                        return (
                          <th key={row.id} className="text-sm font-semibold">
                            <button
                              onClick={() => setSelectRow(row)}
                              className="relative flex w-max flex-col items-start p-2 pr-14 hover:bg-gray-100 hover:ring-1 active:bg-gray-200"
                            >
                              <div className="absolute right-1 top-1 m-auto flex items-center justify-end gap-1">
                                {row?.note && (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-md border bg-white">
                                    <MdOutlineSpeakerNotes />
                                  </div>
                                )}
                                {row.type === "SCAN" && (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-md border bg-white">
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
                        <th key={status.id} className="text-sm font-semibold">
                          <button className="relative flex w-40 flex-col items-start p-2 hover:bg-gray-100 hover:ring-1 active:bg-gray-200">
                            <span>{status.title}</span>
                            <span className="text-xs text-gray-500">Total</span>
                          </button>
                        </th>
                      );
                    })}
              {selectMenu === "Summary" && (
                <th className="text-sm font-semibold">
                  <button className="relative flex w-40 flex-col items-start p-2 hover:bg-gray-100 hover:ring-1 active:bg-gray-200">
                    <span>Total Presents</span>
                    <span className="text-xs text-gray-500">
                      Number of Presents
                    </span>
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {studentOnSubjects.data
              ?.filter((s) => s.isActive)
              ?.sort((a, b) => Number(a.number) - Number(b.number))
              ?.map((student, index) => {
                const odd = index % 2 === 0;

                const attendances = rows.data
                  ?.map((row) => {
                    const attendances = row.attendances.filter(
                      (a) => a.studentOnSubjectId === student.id,
                    );
                    return attendances;
                  })
                  .flat();
                const attendanceWithStatusLists = attendances?.map((a) => {
                  return {
                    ...a,
                    statusList: selectTable.statusLists.find(
                      (s) => s.title === a.status,
                    ),
                  };
                });

                const totalPresents = attendanceWithStatusLists?.reduce(
                  (prev, current) => {
                    return (prev += current.statusList?.value ?? 0);
                  },
                  0,
                );

                return (
                  <tr
                    className={` ${
                      odd ? "bg-gray-200/20" : "bg-white"
                    } group hover:bg-gray-200/40`}
                    key={student.id}
                  >
                    <td
                      className={`sticky left-0 z-30 text-sm font-semibold ${odd ? "bg-gray-100" : "bg-white"} group-hover:bg-gray-200`}
                    >
                      <div className="flex h-14 items-center gap-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-md ring-1 md:h-10 md:w-10">
                          <Image
                            src={student.photo}
                            alt={student.firstName}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            placeholder="blur"
                            blurDataURL={decodeBlurhashToCanvas(
                              student.blurHash ?? defaultBlurHash,
                            )}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h1 className="text-xs font-semibold md:text-sm">
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
                                className="flex h-14 w-full animate-pulse"
                              ></div>
                            </td>
                          );
                        })
                      : selectMenu === "Attendances"
                        ? rows?.data?.map((row, index) => {
                            const attendance = row.attendances.find(
                              (a) => a.studentOnSubjectId === student.id,
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
                                    className="relative flex h-14 w-full cursor-pointer select-none flex-col items-center justify-center bg-black text-white ring-black transition hover:ring-1 hover:drop-shadow-md"
                                  >
                                    NO DATA
                                  </button>
                                </td>
                              );
                            return (
                              <td
                                key={row.id + attendance.id}
                                className="text-sm font-semibold"
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
                                        (s) => s.title === attendance?.status,
                                      )?.color ?? "#94a3b8",
                                  }}
                                  className="relative flex h-14 w-full cursor-pointer flex-col items-center justify-center ring-black transition hover:ring-1 hover:drop-shadow-md"
                                >
                                  {attendance?.note && (
                                    <div className="absolute right-2 top-2 m-auto flex h-5 w-5 items-center justify-center rounded-full bg-white">
                                      <MdOutlineSpeakerNotes />
                                    </div>
                                  )}
                                  <span>{attendance?.status}</span>
                                </button>
                              </td>
                            );
                          })
                        : selectTable.statusLists.map((status) => {
                            const total = attendances?.reduce((acc, curr) => {
                              if (curr.status === status.title) {
                                return acc + 1;
                              } else {
                                return acc;
                              }
                            }, 0);
                            return (
                              <>
                                <td key={status.id}>
                                  <div
                                    style={{
                                      backgroundColor: `${status.color}`,
                                    }}
                                    className="relative flex h-14 w-full cursor-pointer flex-col items-center justify-center ring-black transition hover:ring-1 hover:drop-shadow-md"
                                  >
                                    <span>{total}</span>
                                  </div>
                                </td>
                              </>
                            );
                          })}
                    {selectMenu === "Summary" && (
                      <td>
                        <div className="relative flex h-14 w-full cursor-pointer flex-col items-center justify-center ring-black transition hover:ring-1 hover:drop-shadow-md">
                          <span>{totalPresents}</span>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
