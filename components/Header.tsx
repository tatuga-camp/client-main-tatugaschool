import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { usePathname } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { OverlayPanel } from "primereact/overlaypanel";
import { useGetLanguage, useGetUser } from "../react-query";
import ButtonProfile from "./button/ButtonProfile";
import { defaultBlurHash, defaultCanvas } from "../data";
import LanguageSelect from "./LanguageSelect";
import { navbarLanguageData } from "../data/languages";

const Header = () => {
  const user = useGetUser();
  const pathname = usePathname();
  const language = useGetLanguage();
  const classLinkActive =
    "bg-blue-500/50 text-black px-4  py-2 rounded-md font-semibold";
  const classLinkInactive = "bg-transparent text-black";
  const isSchoolPage = pathname === "/";
  const isAccountPage = pathname.startsWith("/account");
  const isActiveClass = (path: boolean) =>
    path ? classLinkActive : classLinkInactive;
  return (
    <header
      className="flex  h-20 sticky z-50 
     top-0 flex-row justify-between items-center md:p-4 bg-white/50 backdrop-blur text-white gap-4"
    >
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
            blurDataURL={defaultCanvas}
            placeholder="blur"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            alt="logo tatuga school"
          />
        </div>
        <div className="font-bold uppercase hidden md:block text-xs md:text-base text-black">
          Tatuga School
        </div>
      </Link>
      <div className="w-40 overflow-auto md:w-max">
        <nav className="flex items-center w-max justify-center gap-2 md:gap-5">
          <Link
            href="/"
            className={`${isActiveClass(
              isSchoolPage
            )} border h-10 flex items-center justify-center rounded-md px-3`}
          >
            {navbarLanguageData.school(language.data ?? "en")}
          </Link>
          <Link
            href="/account"
            className={`${isActiveClass(
              isAccountPage
            )} border h-10 flex items-center justify-center rounded-md px-3`}
          >
            {navbarLanguageData.account(language.data ?? "en")}
          </Link>
          <LanguageSelect />
        </nav>
      </div>
      <div className="flex justify-center items-center gap-2">
        <ButtonProfile user={user} />
      </div>
    </header>
  );
};

export default Header;
