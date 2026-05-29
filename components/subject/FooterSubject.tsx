import React, { memo, useState } from "react";
import { BsQrCode } from "react-icons/bs";
import { FaRandom, FaStopwatch20, FaWpforms } from "react-icons/fa";
import { TbArrowsRandom } from "react-icons/tb";
import { GiCardPick } from "react-icons/gi";
import { MdHeadphones } from "react-icons/md";
import { PiCloudFog } from "react-icons/pi";
import {
  footerGroupLanguage,
  footerOnSubjectDataLangugae,
} from "../../data/languages";
import { useGetLanguage } from "../../react-query";

type MenuItem = {
  title:
    | "StopWatch"
    | "Attendance"
    | "AttendanceQRCode"
    | "WheelOfName"
    | "SlidePicker"
    | "CardPicker"
    | "NoisyDetector"
    | "WordCloud";
  icon: React.ReactNode;
  inactiveClasses: string;
  activeClasses: string;
};

type MenuGroup = {
  group: keyof typeof footerGroupLanguage;
  icon: React.ReactNode;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    group: "Attendance",
    icon: <FaWpforms />,
    items: [
      {
        title: "Attendance",
        icon: <FaWpforms />,
        inactiveClasses:
          "bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-500 active:text-white",
        activeClasses: "bg-red-500 text-white",
      },
      {
        title: "AttendanceQRCode",
        icon: <BsQrCode />,
        inactiveClasses:
          "bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-500 active:text-white",
        activeClasses: "bg-orange-500 text-white",
      },
    ],
  },
  {
    group: "Pickers",
    icon: <TbArrowsRandom />,
    items: [
      {
        title: "WheelOfName",
        icon: <TbArrowsRandom />,
        inactiveClasses:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 active:bg-yellow-500 active:text-yellow-900",
        activeClasses: "bg-yellow-500 text-yellow-900",
      },
      {
        title: "SlidePicker",
        icon: <FaRandom />,
        inactiveClasses:
          "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-500 active:text-white",
        activeClasses: "bg-indigo-500 text-white",
      },
      {
        title: "CardPicker",
        icon: <GiCardPick />,
        inactiveClasses:
          "bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-500 active:text-white",
        activeClasses: "bg-red-500 text-white",
      },
    ],
  },
  {
    group: "Tools",
    icon: <FaStopwatch20 />,
    items: [
      {
        title: "StopWatch",
        icon: <FaStopwatch20 />,
        inactiveClasses:
          "bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-500 active:text-white",
        activeClasses: "bg-blue-500 text-white",
      },
      {
        title: "NoisyDetector",
        icon: <MdHeadphones />,
        inactiveClasses:
          "bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-500 active:text-white",
        activeClasses: "bg-blue-500 text-white",
      },
    ],
  },
  {
    group: "Activities",
    icon: <PiCloudFog />,
    items: [
      {
        title: "WordCloud",
        icon: <PiCloudFog />,
        inactiveClasses:
          "bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-500 active:text-white",
        activeClasses: "bg-purple-500 text-white",
      },
    ],
  },
];

export type ListMenuFooter = MenuItem["title"] | "EMTY";

type Props = {
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  selectFooter: ListMenuFooter;
};

function FooterSubject({ setSelectFooter, selectFooter }: Props) {
  const language = useGetLanguage();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-full border-t-2 border-black">
      <div className="flex h-14 w-full flex-nowrap items-center justify-center gap-3 bg-white px-3">
        {menuGroups.map((group) => {
          const isOpen = openGroup === group.group;
          const groupActive = group.items.some((i) => i.title === selectFooter);
          return (
            <div key={group.group} className="relative">
              <button
                onClick={() =>
                  setOpenGroup((prev) =>
                    prev === group.group ? null : group.group,
                  )
                }
                className={`flex items-center gap-1 rounded-2xl px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
                  groupActive || isOpen
                    ? "bg-primary-color text-white"
                    : "bg-background-color text-icon-color hover:bg-gray-200"
                }`}
              >
                {group.icon}
                <span>
                  {footerGroupLanguage[group.group](language.data ?? "en")}
                </span>
                <span className="text-[10px] opacity-60">▾</span>
              </button>

              {isOpen && (
                <div className="absolute bottom-full left-1/2 z-50 mb-2 flex -translate-x-1/2 flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                  {group.items.map((menu) => (
                    <button
                      key={menu.title}
                      onClick={() => {
                        setSelectFooter(() =>
                          selectFooter === menu.title ? "EMTY" : menu.title,
                        );
                        setOpenGroup(null);
                      }}
                      className={`flex items-center justify-start gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
                        selectFooter === menu.title
                          ? menu.activeClasses
                          : menu.inactiveClasses
                      }`}
                    >
                      {menu.icon}
                      {footerOnSubjectDataLangugae[
                        menu.title as keyof typeof footerOnSubjectDataLangugae
                      ](language.data ?? "en")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {openGroup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenGroup(null)}
        />
      )}
    </div>
  );
}

export default memo(FooterSubject);
