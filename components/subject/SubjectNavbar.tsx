import React, { ReactNode } from "react";
import ButtonProfile from "../button/ButtonProfile";
import { useGetUser } from "../../react-query";
import { QueryClient, UseQueryResult } from "@tanstack/react-query";
import { IoMenu } from "react-icons/io5";
import SubjectSidebar, { MenuSubject } from "./SubjectSidebar";
import { Subject } from "../../interfaces";
import Link from "next/link";
import Image from "next/image";
import { defaultCanvas } from "../../data";

type Props = {
  subject: UseQueryResult<Subject, Error>;
  setSelectMenu: React.Dispatch<React.SetStateAction<MenuSubject>>;
  selectMenu: MenuSubject;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
};
function SubjectNavbar({
  subject,
  setSelectMenu,
  selectMenu,
  active,
  setActive,
}: Props) {
  const user = useGetUser();

  const queryClient = new QueryClient();
  return (
    <div className="flex flex-col h-20  md:flex-row justify-between items-center p-4 bg-white backdrop-blur text-white gap-4">
      <button
        onClick={() => setActive(!active)}
        className={`text-black flex ${
          active ? "rotate-90" : "rotate-0"
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
            alt="logo tatuga school"
          />
        </div>
        <div className="font-bold uppercase hidden md:block text-xs md:text-base text-icon-color">
          Tatuga School
        </div>
      </Link>
      <ButtonProfile user={user} queryClient={queryClient} />
      <div className="fixed top-0 -z-10 left-0">
        {subject.data && (
          <SubjectSidebar
            setSelectMenu={setSelectMenu}
            active={active}
            selectMenu={selectMenu}
            schoolId={subject.data?.schoolId}
          />
        )}
      </div>
    </div>
  );
}

export default SubjectNavbar;
