import React, { ReactNode, useRef } from "react";
import ButtonProfile from "./button/ButtonProfile";
import { useGetUser } from "../react-query";
import { QueryClient, UseQueryResult } from "@tanstack/react-query";
import { IoMenu } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { defaultCanvas, menuSubjectList } from "../data";
import Sidebar from "./Sidebar";

type Props = {
  schoolId: string;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  trigger: boolean;
  menuLists: { title: string; icon: ReactNode; url?: string }[];
};
function Navbar({
  schoolId,
  setSelectMenu,
  selectMenu,
  setTrigger,
  trigger,
  menuLists,
}: Props) {
  const user = useGetUser();
  return (
    <>
      <div
        className="flex flex-row h-20  justify-between items-center p-4 
    bg-white text-white gap-4"
      >
        <button
          onClick={() => setTrigger(!trigger)}
          className={`text-black flex ${
            trigger ? "rotate-90" : "rotate-0"
          }  hover:bg-primary-color bg-white transition duration-150 hover:text-white 
      items-center justify-center rounded-full text-xl border-2 border-gray-200 p-2`}
        >
          <IoMenu />
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-1 md:gap-3"
        >
          <div
            className="w-10 h-10 rounded-md overflow-hidden ring-1 ring-white
         relative hover:scale-105 active:scale-110 transition duration-150"
          >
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              alt="logo tatuga school"
            />
          </div>
          <div className="font-bold uppercase hidden md:block text-xs md:text-base text-icon-color">
            Tatuga School
          </div>
        </Link>
        <ButtonProfile user={user} />
        <div className="fixed top-0 -z-10 left-0">
          <Sidebar
            menuList={menuLists}
            setSelectMenu={setSelectMenu}
            active={trigger}
            selectMenu={selectMenu}
            schoolId={schoolId}
          />
        </div>
      </div>
    </>
  );
}

export default Navbar;
