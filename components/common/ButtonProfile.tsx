import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import router from "next/router";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters, AiOutlineLogout } from "react-icons/ai";
import { FiHelpCircle, FiMoon } from "react-icons/fi";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdNewReleases,
  MdUpgrade,
} from "react-icons/md";
import { VscReport, VscSettings } from "react-icons/vsc";
import { defaultBlurHash, defaultCanvas } from "../../data";
import { navbarLanguageData } from "../../data/languages";
import { User } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import useClickOutside from "../../hook/useClickOutside";
import useTawkChat from "../../hook/useTawkChat";
import Link from "next/link";
import LanguageSelect from "./LanguageSelect";

type Props = {
  user: UseQueryResult<User, Error>;
  onTriggerFeedback?: () => void;
  schoolId?: string;
};
function ButtonProfile({ user, onTriggerFeedback, schoolId }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const language = useGetLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  const tawk = useTawkChat({ user: user.data, schoolId });
  // The script preloads in the background; only show loading feedback when
  // the user actually asked for the chat before it finished.
  const [chatRequested, setChatRequested] = useState(false);

  // Close the dropdown once a click-initiated load finishes and the chat opens.
  useEffect(() => {
    if (tawk.status === "ready" && chatRequested) {
      setChatRequested(false);
      setIsOpen(false);
    }
  }, [tawk.status, chatRequested]);

  const handleChatSupport = () => {
    if (tawk.status === "ready") {
      tawk.openChat();
      setIsOpen(false);
      return;
    }
    // loading → opens when ready; idle/error → load (or retry) then open.
    // Keep the menu open to show progress.
    setChatRequested(true);
    tawk.openChat();
  };

  const chatWaiting = chatRequested && tawk.status === "loading";

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
            {onTriggerFeedback && (
              <button
                onClick={() => {
                  onTriggerFeedback();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <VscReport size={18} className="text-gray-500" />
                {navbarLanguageData.report(language.data ?? "en")}
              </button>
            )}
            <Link
              href={"https://tatugaschool.com/support/contact-us"}
              target="_blank"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <FiHelpCircle size={18} className="text-gray-500" />
              {navbarLanguageData.helpCenter(language.data ?? "en")}
            </Link>

            {user.data && (
              <button
                disabled={chatWaiting}
                onClick={handleChatSupport}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-70"
              >
                {chatWaiting ? (
                  <AiOutlineLoading3Quarters
                    size={18}
                    className="animate-spin text-gray-500"
                  />
                ) : (
                  <IoChatbubbleEllipsesOutline
                    size={18}
                    className="text-gray-500"
                  />
                )}
                {chatWaiting ? (
                  navbarLanguageData.chatSupportLoading(language.data ?? "en")
                ) : tawk.status === "error" ? (
                  <span className="text-error-color">
                    {navbarLanguageData.chatSupportRetry(language.data ?? "en")}
                  </span>
                ) : (
                  navbarLanguageData.chatSupport(language.data ?? "en")
                )}
              </button>
            )}

            <Link
              href="https://tatugaschool.com/news"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <MdNewReleases size={18} className="text-gray-500" />
              {navbarLanguageData.whatsNew(language.data ?? "en")}
            </Link>

            <div className="my-1 border-t border-gray-100"></div>

            <div className="px-3 py-1">
              <LanguageSelect />
            </div>

            <div className="my-1 border-t border-gray-100"></div>

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
