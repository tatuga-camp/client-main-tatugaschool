import React, { ReactNode } from "react";
import { Assignment, AssignmentType, FileOnAssignment } from "../../interfaces";
import TextEditor from "../common/TextEditor";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import { MdDelete, MdOutlineFileUpload } from "react-icons/md";
import Dropdown from "../common/Dropdown";
import { classworkLists } from "./ClassworkCreate";
import InputNumber from "../common/InputNumber";
import Switch from "../common/Switch";

export type FileClasswork = {
  file: File | null;
  data: FileOnAssignment | null;
  type: string;
  name: string;
  url: string;
};

type Props = {
  classwork: (Assignment & { allowWeight?: boolean }) | undefined;
  files: FileClasswork[];
  onChange: (data: {
    title?: string;
    description?: string;
    beginDate?: string;
    dueDate?: string;
    allowWeight?: boolean;
    weight?: number | null;
    maxScore?: number;
    type?: AssignmentType;
  }) => void;
  onDeleteFile: (file: FileClasswork) => void;
  onUploadFile: (file: FileClasswork[]) => void;
};
function ClasswordView({
  classwork,
  onChange,
  files,
  onDeleteFile,
  onUploadFile,
}: Props) {
  return (
    <main className="w-full h-max flex">
      <section className="w-full flex-col h-max flex mb-40 items-center justify-start gap-5">
        <div className="w-11/12  h-max max-h-max mt-10 p-5 bg-white flex flex-col gap-2 rounded-md border">
          <label className="flex flex-col ">
            <span className="text-base font-medium">Title</span>
            <input
              value={classwork?.title}
              onChange={(e) => onChange({ title: e.target.value })}
              required
              maxLength={999}
              className="main-input"
              placeholder="Title"
            />
          </label>
          {classwork && (
            <div className="w-full h-96 pb-5 ">
              <span className="text-base font-medium">Description</span>
              <TextEditor
                schoolId={classwork?.schoolId}
                value={classwork?.description || ""}
                onChange={(v) =>
                  onChange({
                    description: v,
                  })
                }
              />
            </div>
          )}

          <ul className="w-full h-max flex flex-col gap-2">
            {files?.map((file, index) => {
              const isImage = file.type.includes("image");
              return (
                <li
                  key={index}
                  className="w-full h-20 flex overflow-hidden rounded-md items-center justify-between  bg-white border"
                >
                  <div className="w-full h-full flex items-center justify-start gap-2">
                    <div
                      className="w-16 gradient-bg text-white text-lg flex items-center justify-center
               border-r h-full"
                    >
                      {isImage ? <FaRegFileImage /> : <FaRegFile />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{file.name}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteFile(file)}
                    className="text-xl mr-5 hover:bg-red-300/50 p-2 rounded-full active:scale-105 text-red-500"
                  >
                    <MdDelete />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="w-11/12 h-max p-5 rounded-md bg-white border">
          <h1>Attach File</h1>
          <span className="text-xs text-gray-400">
            Attach file to your classwork, you can attach multiple files.
          </span>
          <div className="w-full  flex items-center justify-center h-20">
            <label
              htmlFor="upload"
              className="text-white flex active:scale-105 transition
           items-center justify-center gap-1
         gradient-bg px-3 py-1 text-lg rounded-md"
            >
              <MdOutlineFileUpload />
              Upload
              <input
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  const filesArray = Array.from(files).map((file) => {
                    return {
                      file,
                      data: null,
                      type: file.type,
                      name: file.name,
                      url: URL.createObjectURL(file),
                    };
                  });
                  onUploadFile(filesArray);
                }}
                id="upload"
                type="file"
                multiple
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>
      <section className="w-4/12 min-h-screen max-h-max flex flex-col gap-2  bg-white  h-full">
        <div className="w-full py-5 flex items-start flex-col px-5  border-b">
          <h1 className="text-lg font-medium">Classwork setting</h1>
          <span className="text-xs text-gray-400">
            Manage the setting of your classwork here
          </span>
          {classwork?.status === "Draft" && (
            <div className="mt-5 bg-gray-500 text-white px-5 py-1 rounded-md">
              {classwork?.status}
            </div>
          )}
          {classwork?.status === "Published" && (
            <div className="mt-5  text-white px-5 py-1 rounded-md gradient-bg ">
              {classwork?.status}
            </div>
          )}
        </div>

        <section className="flex flex-col gap-3 mt-5 px-5 w-10/12">
          <label className="flex border-b pb-2 flex-col  w-full">
            <span className="text-base font-medium">
              Choose Type of Classword
            </span>
            <Dropdown<{ title: string; icon: ReactNode }>
              value={
                classworkLists.find((c) => c.title === classwork?.type) ||
                classworkLists[0]
              }
              disabled={!!classwork?.id}
              itemTemplate={(item) => {
                return (
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                );
              }}
              placeholder="Choose Type of Classwork"
              onChange={(e) => {
                onChange({
                  type: e.value.title as AssignmentType,
                });
              }}
              options={classworkLists}
              optionLabel="title"
            />
          </label>
          <label className="flex flex-col bg-gray-50  w-full">
            <span className="text-base font-medium">Assign At</span>
            <input
              required
              value={classwork?.beginDate}
              onChange={(e) =>
                onChange({
                  beginDate: e.target.value,
                })
              }
              type="datetime-local"
              className="main-input"
            />
          </label>
          {classwork?.type === "Assignment" && (
            <label className="flex flex-col  w-full  border-b pb-2">
              <span className="text-base font-medium">Deadline</span>
              <input
                value={classwork?.dueDate}
                onChange={(e) =>
                  onChange({
                    dueDate: e.target.value,
                  })
                }
                type="datetime-local"
                className="main-input"
              />
            </label>
          )}

          {classwork?.type === "Assignment" && (
            <label className="flex flex-col  w-full border-b pb-2">
              <span className="text-base font-medium">Max Score</span>
              <InputNumber
                required={classwork?.type === "Assignment"}
                value={classwork?.maxScore}
                max={1000}
                min={0}
                onValueChange={(e) =>
                  onChange({
                    maxScore: e,
                  })
                }
              />
            </label>
          )}
          {classwork?.type === "Assignment" && (
            <label className="flex gap-2 items-center justify-between   w-full">
              <span className="text-base font-medium">
                Allow Weight of Classwork
              </span>
              <Switch
                checked={classwork?.allowWeight}
                setChecked={(e) => {
                  let weight = classwork.weight;
                  if (weight === null) {
                    weight = 0;
                  }

                  onChange({
                    allowWeight: e,
                    weight: e ? weight : null,
                  });
                }}
              />
            </label>
          )}
          {classwork?.allowWeight && classwork.type === "Assignment" && (
            <label className="flex flex-col  w-full">
              <span className="text-base font-medium">
                Weight of Classwork (Optional)
              </span>
              <InputNumber
                value={classwork?.weight || 0}
                max={100}
                suffix="%"
                min={0}
                placeholder="percentage of classwork"
                onValueChange={(e) =>
                  onChange({
                    weight: e,
                  })
                }
              />
            </label>
          )}
        </section>
      </section>
    </main>
  );
}

export default ClasswordView;
