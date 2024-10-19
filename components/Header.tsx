import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { destroyCookie, parseCookies } from "nookies";
import { usePathname } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { User } from "../interfaces";
import { OverlayPanel } from "primereact/overlaypanel";
import { AiOutlineLogout } from "react-icons/ai";
import { FaBell } from "react-icons/fa";
import { getUser } from "../react-query";

type props = {
  queryClient: QueryClient;
};
const Header = ({ queryClient }: props) => {
  const [loading, setLoading] = useState(false);
  const user = getUser();
  const ref = useRef<OverlayPanel>(null);
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = () => {
    setLoading(true);
    queryClient.clear();
    destroyCookie(null, "access_token", { path: "/" });
    destroyCookie(null, "refresh_token", { path: "/" });
    router.push("/auth/sign-in");
  };

  const classLinkActive =
    "bg-[#E3E0EF38] text-white px-4 py-2 rounded-md font-semibold";
  const classLinkInactive = "bg-transparent text-white";
  const isSchoolPage = pathname === "/";
  const isAccountPage = pathname.startsWith("/account");
  const isActiveClass = (path: boolean) =>
    path ? classLinkActive : classLinkInactive;
  return (
    <header className="flex flex-col h-20 sticky top-0 md:flex-row justify-between items-center p-4 bg-[#6f47dd84] backdrop-blur text-white gap-4">
      <Link
        href="/"
        className="flex items-center justify-center gap-1 md:gap-3"
      >
        <div
          className="w-10 h-10 rounded-md overflow-hidden ring-1 ring-white
         relative hover:scale-105 active:scale-110 transition duration-150"
        >
          <Image src="/favicon.ico" fill alt="logo tatuga school" />
        </div>
        <div className="font-semibold hidden md:block text-xs md:text-base text-white">
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

      <div className="flex items-center flex-1 justify-end">
        <div className="flex items-center justify-end w-60 transition-width hover:w-96 group bg-white rounded-lg px-4 py-2 gap-4">
          <button className="w-8 h-8 relative bg-white rounded-full  flex items-center justify-center text-primary-color">
            <div
              className="text-white absolute z-50 -right-1 -top-1 rounded-full flex 
            text-xs items-center justify-center  w-4 h-4 bg-red-600"
            >
              1
            </div>
            <FaBell />
          </button>
          <div className="flex gap-2">
            <Image
              src={user.data?.photo || "/favicon.ico"}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full cursor-pointer"
              onClick={() => {
                router.push("/account");
              }}
            />
            <div className=" items-start w-0 h-0 overflow-hidden group-hover:w-max group-hover:h-max duration-300 transition-width flex flex-col justify-center gap-0">
              <h2 className="font-semibold text-sm text-gray-800">
                {user.data?.email}
              </h2>
              <span className="text-xs text-gray-500">
                {user.data?.firstName} {user.data?.lastName}
              </span>
            </div>
          </div>
          <button
            disabled={loading}
            onClick={handleLogout}
            className="flex hover:bg-red-600 transition duration-150 hover:drop-shadow-md active:scale-105
             items-center text-sm justify-center gap-2 px-3
           py-1 bg-red-500 text-white font-semibold rounded-md"
          >
            <AiOutlineLogout />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
