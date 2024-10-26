import { LuSchool } from "react-icons/lu";
import { SiGoogleclassroom } from "react-icons/si";
import { MdAssignmentAdd } from "react-icons/md";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import React, { memo, ReactNode } from "react";
import { useGetSchool, useGetSchools } from "../../react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { CiSettings } from "react-icons/ci";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

const menuList: { title: MenuSubject; icon: ReactNode }[] = [
  {
    title: "School",
    icon: <LuSchool />,
  },
  {
    title: "Subject",
    icon: <SiGoogleclassroom />,
  },
  {
    title: "Assignment",
    icon: <MdAssignmentAdd />,
  },
  {
    title: "Attendance",
    icon: <FaUserGroup />,
  },
  {
    title: "Grade",
    icon: <FaStarHalfStroke />,
  },
  {
    title: "Setting Subject",
    icon: <CiSettings />,
  },
];
type Props = {
  active: boolean;
  schoolId: string;
  setSelectMenu: React.Dispatch<React.SetStateAction<MenuSubject>>;
  selectMenu: MenuSubject;
};
export type MenuSubject =
  | "School"
  | "Subject"
  | "Assignment"
  | "Attendance"
  | "Grade"
  | "Setting Subject";

function SubjectSidebar({
  active,
  schoolId,
  setSelectMenu,
  selectMenu,
}: Props) {
  const router = useRouter();
  const school = useGetSchool({
    schoolId: schoolId,
  });

  console.log(decodeBlurhashToCanvas(defaultBlurHash));
  return (
    <div
      className={`text-black overflow-hidden flex flex-col items-center justify-start gap-3
          bg-white transition-width   h-screen ${
            active ? "w-60  p-5" : "w-0 p-0 "
          } `}
    >
      <header
        className=" mt-16 rounded-lg bg-background-color 
      p-2 flex flex-col items-center justify-center gap-1 w-full h-40"
      >
        <div className="w-12 h-12 bg-white rounded-full relative overflow-hidden">
          <Image
            fill
            src={school.data?.logo ?? "/favicon.ico"}
            className="object-cover"
            alt={`logo ${school.data?.title}`}
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              school.data?.blurHash ?? defaultBlurHash
            )}
          />
        </div>
        <h2 className="text-xs bg-primary-color px-2 rounded-md text-white">
          {school.data?.plan}
        </h2>
        <h2 className="text-xs font-semibold">{school.data?.title}</h2>
        <h2 className="text-xs text-gray-600">{school.data?.phoneNumber}</h2>
      </header>

      <ul className="grid gap-2 w-full">
        {menuList.map((menu, index) => {
          return (
            <button
              onClick={() => {
                if (menu.title === "School") {
                  router.push(`/school/${schoolId}`);
                } else {
                  setSelectMenu(menu.title);
                }
              }}
              key={index}
              className={`flex ${
                menu.title === selectMenu && "bg-primary-color text-white"
              } items-center justify-start gap-2 p-2 rounded-md 
             hover:gradient-bg active:bg-primary-color hover:text-white`}
            >
              {menu.icon}
              <span>{menu.title}</span>
            </button>
          );
        })}
      </ul>
    </div>
  );
}

export default memo(SubjectSidebar);
