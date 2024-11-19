import React, { ReactNode, useEffect } from "react";
import { IoChevronDownSharp, IoClose, IoDuplicate } from "react-icons/io5";
import {
  MdAssignmentAdd,
  MdDelete,
  MdOutlineDataSaverOn,
  MdOutlineFileUpload,
  MdPublish,
  MdUnpublished,
} from "react-icons/md";
import useAdjustPosition from "../../hook/useWindow";
import useClickOutside from "../../hook/useClickOutside";
import TextEditor from "../common/TextEditor";
import { AssignmentType, FileOnAssignment } from "../../interfaces";
import { FaBook, FaRegFile, FaRegFileImage } from "react-icons/fa6";
import Dropdown from "../common/Dropdown";
import InputNumber from "../common/InputNumber";
import Switch from "../common/Switch";

type Props = {
  onClose: () => void;
};

type TitleList =
  | "Publish"
  | "Unpublish"
  | "Save Draft"
  | "Duplicate"
  | "Delete";

const menuClassworkList: { title: TitleList; icon: ReactNode }[] = [
  {
    title: "Publish",
    icon: <MdPublish />,
  },
  {
    title: "Unpublish",
    icon: <MdUnpublished />,
  },
  {
    title: "Save Draft",
    icon: <MdOutlineDataSaverOn />,
  },
  {
    title: "Duplicate",
    icon: <IoDuplicate />,
  },
  {
    title: "Delete",
    icon: <MdDelete />,
  },
];

type FileClasswork = {
  file: File;
  data: FileOnAssignment | null;
  type: string;
  url: string;
};

const classworkLists: { title: AssignmentType; icon: ReactNode }[] = [
  {
    title: "Assignment",
    icon: <MdAssignmentAdd />,
  },
  {
    title: "Material",
    icon: <FaRegFile />,
  },
];
function ClassworkCreate({ onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);
  const [triggerOption, setTriggerOption] = React.useState(false);
  const [files, setFiles] = React.useState<FileClasswork[]>();
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const adjustedStyle = useAdjustPosition(divRef, 20); // 20px padding
  const [classwork, setClasswork] = React.useState<{
    title?: string;
    description?: string;
    type?: AssignmentType;
    maxScore?: number;
    weight?: number;
    allowWeight?: boolean;
  }>({
    type: "Assignment",
  });

  useClickOutside(divRef, () => {
    setTriggerOption(false);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const filesArray = Array.from(files).map((file) => {
      return {
        file,
        data: null,
        type: file.type,
        url: URL.createObjectURL(file),
      };
    });
    setFiles((prev) => {
      return [...(prev ?? []), ...filesArray];
    });
  };

  const handleDeleteFile = async (file: FileClasswork) => {
    if (!file.data) {
      setFiles((prev) => {
        return prev?.filter((f) => f.url !== file.url);
      });
    }
  };

  return (
    <div className="flex flex-col">
      <nav className="w-full px-5  bg-white border-b h-20 flex items-center justify-between">
        <section className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 text-3xl border rounded-full flex items-center justify-center
           hover:bg-gray-300/50 transition active:scale-105"
          >
            <IoClose />
          </button>

          <div
            className="w-10 h-10 text-3xl border rounded-full flex items-center justify-center
           bg-primary-color/30 text-primary-color"
          >
            <MdAssignmentAdd />
          </div>
          <h1 className="text-lg font-medium">Class Classwork</h1>
        </section>
        <section className="flex items-center gap-[2px]">
          <button
            className="w-40 p-2 h-10 opacity-85 hover:opacity-100 font-medium rounded-r-none rounded-md text-base text-white
         gradient-bg"
          >
            Save Draft
          </button>
          <button
            onClick={() => setTriggerOption((prev) => !prev)}
            className="w-max p-2 h-10  font-medium rounded-l-none rounded-md text-base text-white
         gradient-bg"
          >
            <IoChevronDownSharp />
          </button>

          {triggerOption && (
            <div
              style={{
                position: "absolute",
                ...adjustedStyle,
              }}
              ref={divRef}
            >
              <div className="w-52 h-max z-40 p-1 absolute top-8 rounded-md bg-white drop-shadow border">
                {menuClassworkList.map((menu, index) => (
                  <button
                    key={index}
                    className={`w-full p-2 flex gap-10 items-center justify-start text-base
                 font-medium 
                 ${
                   menu.title === "Delete"
                     ? "text-red-500 hover:bg-red-500 hover:text-white"
                     : "text-gray-500 hover:bg-primary-color hover:text-white"
                 }
                 `}
                  >
                    {menu.icon}
                    {menu.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </nav>
      <main className="w-full  h-screen pb-40 overflow-auto flex">
        <section className="w-full flex-col h-max flex items-center justify-start gap-5">
          <div className="w-11/12  h-max max-h-max mt-10 p-5 bg-white flex flex-col gap-2 rounded-md border">
            <label className="flex flex-col ">
              <span className="text-base font-medium">Title</span>
              <input className="main-input" placeholder="Title" />
            </label>
            <div className="w-full h-screen ">
              <TextEditor
                value={classwork?.description || ""}
                onChange={(v) =>
                  setClasswork((prev) => {
                    return { ...prev, description: v };
                  })
                }
              />
            </div>

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
                        <span>{file.file.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file)}
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
                  onChange={handleFileChange}
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
                itemTemplate={(item) => {
                  return (
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  );
                }}
                placeholder="Choose Type of Classwork"
                onChange={(e) =>
                  setClasswork((prev) => {
                    return {
                      ...prev,
                      type: e.target.value.title,
                    };
                  })
                }
                options={classworkLists}
                optionLabel="title"
              />
            </label>
            <label className="flex flex-col bg-gray-50  w-full">
              <span className="text-base font-medium">Assign At</span>
              <input type="datetime-local" className="main-input" />
            </label>
            {classwork?.type === "Assignment" && (
              <label className="flex flex-col  w-full  border-b pb-2">
                <span className="text-base font-medium">Deadline</span>
                <input type="datetime-local" className="main-input" />
              </label>
            )}

            {classwork?.type === "Assignment" && (
              <label className="flex flex-col  w-full border-b pb-2">
                <span className="text-base font-medium">Max Score</span>
                <InputNumber
                  value={classwork?.maxScore}
                  max={1000}
                  min={0}
                  onValueChange={(e) =>
                    setClasswork((prev) => {
                      return {
                        ...prev,
                        maxScore: e,
                      };
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
                  setChecked={(e) =>
                    setClasswork((prev) => {
                      return {
                        ...prev,
                        weight: e ? prev?.weight : undefined,
                        allowWeight: e,
                      };
                    })
                  }
                />
              </label>
            )}
            {classwork?.allowWeight && classwork.type === "Assignment" && (
              <label className="flex flex-col  w-full">
                <span className="text-base font-medium">
                  Weight of Classwork (Optional)
                </span>
                <InputNumber
                  value={classwork?.weight}
                  max={100}
                  suffix="%"
                  min={0}
                  placeholder="percentage of classwork"
                  onValueChange={(e) =>
                    setClasswork((prev) => {
                      return {
                        ...prev,
                        weight: e,
                      };
                    })
                  }
                />
              </label>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default ClassworkCreate;
