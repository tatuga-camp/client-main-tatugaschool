import React, { ReactNode, useEffect } from "react";
import { IoChevronDownSharp, IoClose, IoDuplicate } from "react-icons/io5";
import {
  MdAssignmentAdd,
  MdDelete,
  MdOutlineDataSaverOn,
  MdPublish,
  MdUnpublished,
} from "react-icons/md";
import useAdjustPosition from "../../hook/useWindow";
import useClickOutside from "../../hook/useClickOutside";
import TextEditor from "../common/TextEditor";

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
function ClassworkCreate({ onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);
  const [triggerOption, setTriggerOption] = React.useState(false);
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const adjustedStyle = useAdjustPosition(divRef, 20); // 20px padding
  const [classwork, setClasswork] = React.useState<{
    title?: string;
    description?: string;
  }>();

  useClickOutside(divRef, () => {
    setTriggerOption(false);
  });
  return (
    <div className="flex flex-col">
      <nav className="w-full px-5 bg-white border-b h-20 flex items-center justify-between">
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
              <div className="w-52 h-max p-1 absolute top-8 rounded-md bg-white drop-shadow border">
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
        <section className="w-full h-max flex items-start justify-center">
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
          </div>
        </section>
        <section className="w-5/12 min-h-screen max-h-max bg-white  h-full">
          <div className="w-full py-5 flex items-start flex-col px-5 border-b">
            <h1 className="text-lg font-medium">Classwork setting</h1>
            <span className="text-xs text-gray-400">
              Manage the setting of your classwork here
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ClassworkCreate;
