import React from "react";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/router";

import { destroyCookie, parseCookies } from "nookies";
import { usePathname } from "next/navigation";

const Header = ({ clearUser }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const cookies = parseCookies();

  const handleLogout = () => {
    clearUser();
    destroyCookie(null, "access_token", { path: "/" });
    destroyCookie(null, "refresh_token", { path: "/" });

    console.log("Cookie deleted successfully", { cookies });

    console.log("Logged out successfully");
    router.push("/auth/login");
  };

  const classLinkActive =
    "bg-[#E3E0EF38] text-white px-4 py-2 rounded-md font-semibold";
  const classLinkInactive = "bg-transparent text-white";
  const isSchoolPage = pathname.startsWith("/school");
  const isAccountPage = pathname.startsWith("/account");
  const isActiveClass = (path: boolean) =>
    path ? classLinkActive : classLinkInactive;
  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#6f47dd] text-white gap-4">
      <div className="flex items-center flex-1">
        <Image
          src="/full-logo-white.svg"
          alt="Tatuga School"
          width={50}
          height={50}
          className="w-full md:w-auto"
        />
      </div>

      <nav className="flex flex-1 flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mt-4 md:mt-0 w-full md:w-auto justify-center">
        <Link href="/school/list" className={isActiveClass(isSchoolPage)}>
          Schools
        </Link>
        <Link href="/account" className={isActiveClass(isAccountPage)}>
          Account
        </Link>
      </nav>

      <div className="flex items-center flex-1 justify-end">
        <div className="flex items-center justify-end bg-white rounded-lg px-4 py-2 gap-4">
          <Image src="/icon-th.svg" alt="Thai" width={24} height={24} />
          <Image
            src="/icon-noti.svg"
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
          <Image
            src="/icon-avatar.svg"
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full"
            onClick={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
