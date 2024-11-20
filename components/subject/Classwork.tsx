import { Toast } from "primereact/toast";
import React from "react";
import { FaBook, FaPlus } from "react-icons/fa6";
import { MdAssignment, MdDragIndicator } from "react-icons/md";
import ClassworkCreate, { classworkLists } from "./ClassworkCreate";
import { useGetAssignments } from "../../react-query";
import parse from "html-react-parser";
import { Assignment } from "../../interfaces";

type Props = {
  toast: React.RefObject<Toast>;
  subjetId: string;
};
function Classwork({ toast, subjetId }: Props) {
  const [triggerCreate, setTriggerCreate] = React.useState(false);
  const classworks = useGetAssignments({ subjectId: subjetId });
  const [selectClasswork, setSelectClasswork] =
    React.useState<Assignment | null>(null);

  return (
    <>
      {triggerCreate && (
        <div
          className={`fixed flex
          } top-0 bottom-0 right-0 left-0 flex items-center justify-center m-auto z-50`}
        >
          <div className="bg-background-color w-screen h-screen ">
            <ClassworkCreate
              subjectId={subjetId}
              toast={toast}
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreate(false);
              }}
            />
          </div>
        </div>
      )}
      <header className="w-full flex justify-between px-40">
        <section>
          <h1 className="text-3xl font-semibold">Classwork</h1>
          <span className="text-gray-400">
            You can assign a task to your students here and track their progress
          </span>
        </section>

        <section className="flex font-Anuphan items-center gap-1">
          <button
            onClick={() => setTriggerCreate((prev) => !prev)}
            className="second-button relative   flex items-center w-52 justify-center gap-1 py-1 border "
          >
            <div className="flex items-center justify-center gap-2">
              <FaPlus />
              Create Classwork
            </div>
          </button>
        </section>
      </header>

      <main className="w-full mt-20 place-items-center grid gap-5 px-40">
        {classworks.isLoading && <div>Loading...</div>}
        {classworks.data?.map((classwork) => {
          return (
            <button
              onClick={() =>
                setSelectClasswork((prev) => {
                  if (prev?.id === classwork.id) {
                    return null;
                  }

                  return classwork;
                })
              }
              className="w-8/12 h-full flex flex-col transition-height"
              key={classwork.id}
            >
              <div
                className={`flex items-stretch w-full h-max  relative justify-start gap-2
                 overflow-hidden hover:ring   bg-white  rounded-md border
                 ${selectClasswork?.id === classwork.id && "rounded-b-none"}
                 `}
              >
                <div
                  className={`p-2 w-16 flex flex-col gap-2 items-center justify-center 
              h-full   text-2xl text-white
              ${classwork.status === "Draft" ? "bg-gray-400" : "gradient-bg"}
              `}
                >
                  {
                    classworkLists.find((item) => item.title === classwork.type)
                      ?.icon
                  }
                  <span className="text-xs">{classwork.status}</span>
                </div>
                <div className="flex h-max p-2  flex-col gap-2 w-9/12">
                  <div className="font-semibold text-start text-lg border-b max-w-[80%] truncate">
                    {classwork.title}
                  </div>
                  <div className="text-gray-500 text-xs flex gap-1">
                    {new Date(classwork.beginDate).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        minute: "numeric",
                        hour: "numeric",
                      }
                    )}
                  </div>
                  <ul className="flex flex-wrap items-end gap-2 w-full">
                    <li className="w-max h-max bg-gray-50  border p-1 rounded-md flex flex-col items-center justify-start ga-2 ">
                      <span className="font-medium max-w-40 truncate text-primary-color text-base">
                        {classwork.maxScore.toLocaleString()}
                      </span>
                      <span className="text-xs">Score</span>
                    </li>
                    {classwork.weight && (
                      <li className="w-max h-max bg-gray-50  border p-1 rounded-md flex flex-col items-center justify-start ga-2 ">
                        <span className="font-medium max-w-40 truncate text-primary-color text-base">
                          {classwork.weight}%
                        </span>
                        <span className="text-xs">Weight</span>
                      </li>
                    )}
                    {classwork.dueDate && (
                      <li
                        className="w-max h-max bg-gray-50 gap-1  border p-1
                     rounded-md flex  items-center justify-start"
                      >
                        <span className="font-medium  truncate text-red-700 text-sm">
                          {new Date(classwork.dueDate).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              minute: "numeric",
                              hour: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-xs">Deadline</span>
                      </li>
                    )}
                  </ul>
                </div>
                <div
                  className="w-6 h-10 rounded-md hover:bg-gray-300/50 
              flex items-center justify-center absolute top-2 right-2 "
                >
                  <MdDragIndicator />
                </div>
              </div>
              <div
                className={`${
                  selectClasswork?.id === classwork.id
                    ? "h-80  border border-t-0"
                    : "h-0"
                } bg-white rounded-md text-start rounded-t-none overflow-hidden w-full transition-height   `}
              >
                <p
                  className={`  overflow-auto
                  ${selectClasswork?.id === classwork.id ? "h-60 p-5" : "h-0"}
                  `}
                >
                  {parse(classwork.description)}
                </p>
                <div className="flex gap-2 border-t  items-center p-2 h-20">
                  <button className="main-button w-40">View</button>
                </div>
              </div>
            </button>
          );
        })}
      </main>
    </>
  );
}

export default Classwork;
