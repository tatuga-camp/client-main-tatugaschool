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
    <header className="sticky top-0 z-50 flex h-20 flex-row items-center justify-between gap-4 bg-white/50 text-white backdrop-blur md:p-4">
      <Link
        href={
          user.data?.favoritSchool ? `/school/${user.data?.favoritSchool}` : "/"
        }
        className="flex items-center justify-center gap-1 md:gap-3"
      >
        <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
          <Image
            src="/favicon.ico"
            blurDataURL={defaultCanvas}
            placeholder="blur"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            alt="logo tatuga school"
          />
        </div>
        <div className="hidden text-xs font-bold uppercase text-black lg:block xl:text-base">
          Tatuga School
        </div>
      </Link>
      <div className="w-40 overflow-auto md:w-max">
        <nav className="flex w-max items-center justify-center gap-2 md:gap-5">
          <Link
            href="/"
            className={`${isActiveClass(
              isSchoolPage,
            )} flex h-10 items-center justify-center rounded-md border px-3`}
          >
            {navbarLanguageData.school(language.data ?? "en")}
          </Link>
          <Link
            href="/account"
            className={`${isActiveClass(
              isAccountPage,
            )} flex h-10 items-center justify-center rounded-md border px-3`}
          >
            {navbarLanguageData.account(language.data ?? "en")}
          </Link>
          <LanguageSelect />
        </nav>
      </div>
      <div className="flex items-center justify-center gap-2">
        <ButtonProfile user={user} />
      </div>
    </header>
  );
};

export default Header;
