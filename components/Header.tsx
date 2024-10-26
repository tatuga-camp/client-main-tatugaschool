import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { usePathname } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { OverlayPanel } from "primereact/overlaypanel";
import { useGetUser } from "../react-query";
import ButtonProfile from "./button/ButtonProfile";
import { defaultBlurHash, defaultCanvas } from "../data";

const Header = () => {
  const queryCliclient = new QueryClient();
  const user = useGetUser();
  const pathname = usePathname();

  const classLinkActive =
    "bg-[#E3E0EF38] text-white px-4 py-2 rounded-md font-semibold";
  const classLinkInactive = "bg-transparent text-white";
  const isSchoolPage = pathname === "/";
  const isAccountPage = pathname.startsWith("/account");
  const isActiveClass = (path: boolean) =>
    path ? classLinkActive : classLinkInactive;
  return (
    <header
      className="flex flex-col h-20 sticky z-50
     top-0 md:flex-row justify-between items-center p-4 bg-[#6f47dd84] backdrop-blur text-white gap-4"
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
            alt="logo tatuga school"
          />
        </div>
        <div className="font-bold uppercase hidden md:block text-xs md:text-base text-white">
          Tatuga School
        </div>
      </Link>

      <nav className="flex flex-1 flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mt-4 md:mt-0 w-full md:w-auto justify-center">
        <Link href="/" className={isActiveClass(isSchoolPage)}>
          Schools
        </Link>
        <Link href="/account" className={isActiveClass(isAccountPage)}>
          Account
        </Link>
      </nav>

      <ButtonProfile user={user} queryClient={queryCliclient} />
    </header>
  );
};

export default Header;
