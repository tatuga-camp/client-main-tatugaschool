import React, { memo, ReactNode } from "react";
import { FaRandom, FaStopwatch20, FaWpforms } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { PiStudentBold } from "react-icons/pi";
import { TbArrowsRandom } from "react-icons/tb";

const menuFooters: { title: ListMenuFooter; icon: ReactNode }[] = [
  {
    title: "Manage Student",
    icon: <PiStudentBold />,
  },
  {
    title: "Stop Watch",
    icon: <FaStopwatch20 />,
  },
  {
    title: "Attendance",
    icon: <FaWpforms />,
  },
  {
    title: "Wheel Of Name",
    icon: <TbArrowsRandom />,
  },
  {
    title: "QR Code",
    icon: <FaStopwatch20 />,
  },
  {
    title: "Slide Picker",
    icon: <FaRandom />,
  },
];

export type ListMenuFooter =
  | "Manage Student"
  | "Stop Watch"
  | "Wheel Of Name"
  | "Attendance"
  | "Random Picker"
  | "QR Code"
  | "EMTY"
  | "Slide Picker";

type Props = {
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  selectFooter: ListMenuFooter;
};
function FooterSubject({ setSelectFooter, selectFooter }: Props) {
  return (
    <div className="w-full h-16 flex items-center justify-center flex-wrap gap-3 bg-white">
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
            {menu.title}
          </h1>
        </button>
      ))}
    </div>
  );
}

export default memo(FooterSubject);
