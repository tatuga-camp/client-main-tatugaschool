import React, { ReactNode, useRef } from "react";
import ButtonProfile from "./button/ButtonProfile";
import { useGetUser } from "../react-query";
import { QueryClient, UseQueryResult } from "@tanstack/react-query";
import { IoMenu } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { defaultCanvas, menuSubjectList } from "../data";
import Sidebar from "./Sidebar";
import LanguageSelect from "./LanguageSelect";
import { MdHelp } from "react-icons/md";

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
      <div className="flex h-20 flex-row items-center justify-between gap-4 bg-white p-4 text-white">
        <div className="flex gap-2">
          <button
            onClick={() => setTrigger(!trigger)}
            className={`flex text-black ${
              trigger ? "rotate-90" : "rotate-0"
            } items-center justify-center rounded-full border-2 border-gray-200 bg-white p-2 text-xl transition duration-150 hover:bg-primary-color hover:text-white`}
          >
            <IoMenu />
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-1 md:gap-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
              <Image
                src="/favicon.ico"
                placeholder="blur"
                blurDataURL={defaultCanvas}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                alt="logo tatuga school"
              />
            </div>
            <div className="hidden text-xs font-bold uppercase text-icon-color md:block md:text-base">
              Tatuga School
            </div>
          </Link>
        </div>
        <div className="w-60 overflow-auto md:w-max">
          <div className="flex w-max items-center justify-center gap-2">
            <a
              target="_blank"
              title="Help"
              className="text-gray-200 hover:text-gray-500"
              href="https://document-tatugaschool.my.canva.site"
            >
              <MdHelp className="text-3xl" />
            </a>
            <LanguageSelect />
            <ButtonProfile user={user} />
          </div>
        </div>
        <div className="fixed left-0 top-0 -z-10">
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
