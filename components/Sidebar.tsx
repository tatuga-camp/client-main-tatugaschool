import { useRouter } from "next/router";
import React, { memo, ReactNode, useEffect, useState } from "react";
import { sidebarDataLanguage } from "../data/languages/sidebar";
import { useGetLanguage } from "../react-query";
import { highlightedMenu } from "../utils/sidebarState";
import SidebarTrail, { TrailNode } from "./sidebar/SidebarTrail";

type Props = {
  active: boolean | null;
  schoolId: string;
  menuList: { title: string; icon: ReactNode; url?: string }[];
  trail: TrailNode[];
  defaultMenu: string;
  onNavigate?: () => void;
};

function Sidebar({ active, menuList, trail, defaultMenu, onNavigate }: Props) {
  const language = useGetLanguage();
  const router = useRouter();
  const selectMenu = highlightedMenu(router.query.menu, defaultMenu);

  // Restored-open state on a fresh mount should appear, not slide in.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
      className={`fixed left-0 top-20 z-40 flex h-[calc(100vh-5rem)] w-72 max-w-[min(18rem,85vw)] flex-col items-center justify-start gap-3 overflow-y-auto overflow-x-hidden border-r-2 border-black bg-white p-4 text-black shadow-lg ${animate ? "transition-transform duration-200" : ""} xl:w-60 xl:max-w-none xl:p-5 xl:shadow-none 2xl:w-72 ${visibilityClass}`}
    >
      <SidebarTrail trail={trail} onNavigate={onNavigate} />
      <div aria-hidden className="h-px w-full shrink-0 bg-icon-color/10" />

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
              aria-current={menu.title === selectMenu ? "page" : undefined}
              className={`flex min-w-0 ${
                menu.title === selectMenu ? "bg-primary-color text-white" : ""
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
