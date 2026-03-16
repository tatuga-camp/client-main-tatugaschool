import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import router from "next/router";
import { useRef, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { FiHelpCircle, FiMoon } from "react-icons/fi";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdUpgrade,
} from "react-icons/md";
import { VscSettings } from "react-icons/vsc";
import { defaultBlurHash, defaultCanvas } from "../../data";
import { navbarLanguageData } from "../../data/languages";
import { User } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import useClickOutside from "../../hook/useClickOutside";
import Link from "next/link";

type Props = {
  user: UseQueryResult<User, Error>;
};
function ButtonProfile({ user }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const language = useGetLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  const handleLogout = () => {
    setLoading(true);
    queryClient.clear();
    // 1. Get all cookies as a raw string
    const cookies = document.cookie.split(";");

    // 2. Define the specific domains causing the duplication
    const possibleDomains = [
      undefined, // 1. Default (current domain/host)
      "app.tatugaschool.com", // 2. The subdomain
      ".tatugaschool.com", // 3. The wildcard parent (The likely duplicate)
      "tatugaschool.com", // 4. The root without dot (just in case)
    ];

    // 3. Loop through EVERY cookie found
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // 4. Try to delete that cookie name on EVERY possible domain
      possibleDomains.forEach((domain) => {
        // Construct the domain string if a domain is provided
        const domainString = domain ? `; domain=${domain}` : "";

        // Force expire
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainString}`;
      });
    });
    router.push("/auth/sign-in");
  };

  return (
    <div className="relative flex items-center justify-end" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 transition-colors hover:bg-gray-50"
      >
        <div className="relative h-7 w-7 overflow-hidden rounded-full">
          <Image
            src={user.data?.photo || defaultCanvas}
            alt="User Avatar"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              user.data?.blurHash ?? defaultBlurHash,
            )}
            className="object-cover"
          />
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 md:block">
          {user.data?.firstName}
        </span>

        {isOpen ? (
          <MdKeyboardArrowUp className="text-gray-500" size={20} />
        ) : (
          <MdKeyboardArrowDown className="text-gray-500" size={20} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {/* Header */}
          <div className="mb-2 flex items-center gap-3 border-b border-gray-100 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image
                src={user.data?.photo || defaultCanvas}
                alt="User Avatar"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  user.data?.blurHash ?? defaultBlurHash,
                )}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-gray-800">
                  {user.data?.firstName}
                </span>
                {user.data?.role && (
                  <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                    {user.data.role}
                  </span>
                )}
              </div>
              <span className="truncate text-xs text-gray-500">
                {user.data?.email}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/account");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <VscSettings size={18} className="text-gray-500" />
              {navbarLanguageData.profileSettings(language.data ?? "en")}
            </button>

            <Link
              href={"https://tatugaschool.com/support/contact-us"}
              target="_blank"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <FiHelpCircle size={18} className="text-gray-500" />
              {navbarLanguageData.helpCenter(language.data ?? "en")}
            </Link>

            <button
              disabled={loading}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <AiOutlineLogout
                size={18}
                className={loading ? "text-gray-300" : "text-red-500"}
              />
              {navbarLanguageData.logoutButton(language.data ?? "en")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonProfile;
