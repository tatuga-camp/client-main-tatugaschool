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
  },
  {
    title: "Attendance",
    icon: <FaWpforms />,
  },
  {
    title: "AttendanceQRCode",
    icon: <BsQrCode />,
  },
  {
    title: "WheelOfName",
    icon: <TbArrowsRandom />,
  },
  {
    title: "SlidePicker",
    icon: <FaRandom />,
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
    <div className="w-full max-w-full overflow-x-auto ">
      <div
        className="  h-14 min-w-full w-max px-3 flex items-center 
    justify-center flex-nowrap  gap-3 bg-white"
      >
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
                ? "gradient-bg text-white"
                : "bg-primary-color/10 text-primary-color"
            }
            flex px-4 py-2 hover:bg-primary-color/20  group rounded-md
            active:gradient-bg active:text-white transition 
             items-center justify-center gap-1`}
          >
            {menu.icon}
            <h1
              className={`text-xs text-gray-500 ${
                selectFooter === menu.title && "text-white"
              } group-active:text-white`}
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
