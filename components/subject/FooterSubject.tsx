import React, { memo } from "react";
import { BsQrCode } from "react-icons/bs";
import { FaRandom, FaStopwatch20, FaWpforms } from "react-icons/fa";
import { TbArrowsRandom } from "react-icons/tb";
import { footerOnSubjectDataLangugae } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

const menuFooters = [
  {
    title: "StopWatch",
    icon: <FaStopwatch20 />,
    // Blue
    inactiveClasses:
      "bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-500 active:text-white",
    activeClasses: "bg-blue-500 text-white",
  },
  {
    title: "Attendance",
    icon: <FaWpforms />,
    // Red
    inactiveClasses:
      "bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-500 active:text-white",
    activeClasses: "bg-red-500 text-white",
  },
  {
    title: "AttendanceQRCode",
    icon: <BsQrCode />,
    // Orange
    inactiveClasses:
      "bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-500 active:text-white",
    activeClasses: "bg-orange-500 text-white",
  },
  {
    title: "WheelOfName",
    icon: <TbArrowsRandom />,
    // Yellow (using darker text for contrast)
    inactiveClasses:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 active:bg-yellow-500 active:text-yellow-900",
    activeClasses: "bg-yellow-500 text-yellow-900",
  },
  {
    title: "SlidePicker",
    icon: <FaRandom />,
    // Indigo
    inactiveClasses:
      "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-500 active:text-white",
    activeClasses: "bg-indigo-500 text-white",
  },
] as const;

export type ListMenuFooter = (typeof menuFooters)[number]["title"] | "EMTY";

type Props = {
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  selectFooter: ListMenuFooter;
};
function FooterSubject({ setSelectFooter, selectFooter }: Props) {
  const language = useGetLanguage();
  return (
    <div className="w-full max-w-full overflow-x-auto border-t-2 border-black">
      <div className="flex h-14 w-max min-w-full flex-nowrap items-center justify-center gap-3 bg-white px-3">
        {menuFooters.map((menu, index) => (
          <button
            onClick={() =>
              setSelectFooter(() => {
                if (selectFooter === menu.title) return "EMTY";
                return menu.title;
              })
            }
            key={index}
            className={` ${
              selectFooter === menu.title
                ? menu.activeClasses
                : menu.inactiveClasses
            } group flex items-center justify-center gap-1 rounded-2xl px-4 py-2 transition-colors duration-200`}
          >
            {menu.icon}
            <h1
              className={`text-xs font-semibold text-gray-500 ${
                selectFooter === menu.title
                  ? menu.title === "WheelOfName" // Special case for yellow
                    ? "text-yellow-900"
                    : "text-white"
                  : "" // Use gray-500 by default
              } ${
                menu.title === "WheelOfName" // Special case for yellow
                  ? "group-active:text-yellow-900"
                  : "group-active:text-white"
              } `}
            >
              {footerOnSubjectDataLangugae[
                menu.title as keyof typeof footerOnSubjectDataLangugae
              ](language.data ?? "en")}
            </h1>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(FooterSubject);
