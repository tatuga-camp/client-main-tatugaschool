import Image from "next/image";
import { useRouter } from "next/router";
import React, { memo, ReactNode } from "react";
import { defaultBlurHash } from "../data";
import { sidebarDataLanguage } from "../data/languages/sidebar";
import { useGetLanguage, useGetSchool } from "../react-query";
import { decodeBlurhashToCanvas } from "../utils";
import PlanBadge from "./common/PlanBadge";

type Props = {
  active: boolean | null;
  schoolId: string;
  menuList: { title: string; icon: ReactNode; url?: string }[];
  onNavigate?: () => void;
};

function Sidebar({ active, schoolId, menuList, onNavigate }: Props) {
  const language = useGetLanguage();
  const router = useRouter();
  const selectMenu = router.query.menu;

  const school = useGetSchool({
    schoolId: schoolId,
  });

  const visibilityClass =
    active === null
      ? "-translate-x-full pointer-events-none xl:translate-x-0 xl:pointer-events-auto"
      : active
        ? "translate-x-0 pointer-events-auto"
        : "-translate-x-full pointer-events-none";

  return (
    <aside
      id="school-sidebar"
      aria-hidden={active === false}
      className={`fixed left-0 top-20 z-40 flex h-[calc(100vh-5rem)] w-72 max-w-[min(18rem,85vw)] flex-col items-center justify-start gap-3 overflow-y-auto overflow-x-hidden border-r-2 border-black bg-white p-4 text-black shadow-lg transition-transform duration-200 xl:w-60 xl:max-w-none xl:p-5 xl:shadow-none 2xl:w-72 ${visibilityClass}`}
    >
      <header className="flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-2xl bg-background-color p-2 2xl:min-h-36">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white">
          <Image
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src={school.data?.logo ?? "/favicon.ico"}
            className="object-cover"
            alt={`logo ${school.data?.title}`}
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              school.data?.blurHash ?? defaultBlurHash,
            )}
          />
        </div>
        <PlanBadge plan={school.data?.plan ?? "FREE"} />
        <h2 className="w-full break-words px-1 text-center text-xs font-semibold">
          {school.data?.title}
        </h2>
        <h2 className="w-full break-all px-1 text-center text-xs text-gray-600">
          {school.data?.phoneNumber}
        </h2>
      </header>

      <ul className="flex h-full w-full flex-col gap-2 overflow-y-auto">
        {menuList.map((menu, index) => {
          return (
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                if (menu.url) {
                  router.push(menu.url);
                } else {
                  router.replace({
                    query: { ...router.query, menu: menu.title },
                  });
                }
                onNavigate?.();
              }}
              key={index}
              className={`flex min-w-0 ${
                menu.title === selectMenu && "bg-primary-color text-white"
              } hover:gradient-bg items-center justify-start gap-2 rounded-2xl p-2 hover:text-white active:bg-primary-color`}
            >
              <span className="shrink-0">{menu.icon}</span>
              <span className="min-w-0 break-words text-left">
                {sidebarDataLanguage[
                  menu.title.toLowerCase() as keyof typeof sidebarDataLanguage
                ](language.data ?? "en")}
              </span>
            </button>
          );
        })}
      </ul>
    </aside>
  );
}

export default memo(Sidebar);
