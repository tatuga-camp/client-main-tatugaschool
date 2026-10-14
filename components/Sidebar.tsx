import { useRouter } from "next/router";
import React, { memo, ReactNode } from "react";
import { sidebarDataLanguage } from "../data/languages/sidebar";
import { useGetLanguage } from "../react-query";
import { highlightedMenu } from "../utils/sidebarState";
import SidebarTrail, { TrailNode } from "./sidebar/SidebarTrail";

type Props = {
  /** Phones only: whether the overlay rail is shown. Ignored from `md` up. */
  open: boolean;
  onNavigate?: () => void;
  menuList: { title: string; icon: ReactNode; url?: string }[];
  trail: TrailNode[];
  defaultMenu: string;
};

/**
 * Always-visible sidebar: a labeled icon rail below `lg`, a compact list from
 * `lg` up. Below `md` it overlays the page and slides in on demand. Width must match
 * `components/sidebar/sidebarLayout.ts`.
 */
function Sidebar({ open, onNavigate, menuList, trail, defaultMenu }: Props) {
  const language = useGetLanguage();
  const router = useRouter();
  const selectMenu = highlightedMenu(router.query.menu, defaultMenu);

  return (
    <aside
      id="school-sidebar"
      className={`fixed left-0 top-20 z-40 flex h-[calc(100dvh-5rem)] w-[4.5rem] flex-col gap-2 overflow-y-auto overflow-x-hidden border-r-2 border-black bg-white px-1 py-3 font-Anuphan text-icon-color shadow-lg transition-transform duration-200 md:translate-x-0 md:shadow-none lg:w-52 lg:gap-3 lg:px-3 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarTrail trail={trail} />
      <div aria-hidden className="h-px w-full shrink-0 bg-icon-color/10" />

      <nav aria-label="Menu" className="w-full">
        <ul className="flex w-full flex-col gap-1">
          {menuList.map((menu) => {
            const label = sidebarDataLanguage[
              menu.title.toLowerCase() as keyof typeof sidebarDataLanguage
            ](language.data ?? "en");
            const selected = menu.title === selectMenu;
            return (
              <li key={menu.title}>
                <button
                  type="button"
                  title={label}
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
                  aria-current={selected ? "page" : undefined}
                  className={`flex w-full min-w-0 flex-col items-center gap-0.5 rounded-xl py-1 transition-colors lg:flex-row lg:gap-2.5 lg:px-2.5 lg:py-2 ${
                    selected
                      ? "font-semibold text-primary-color lg:bg-primary-color lg:text-white"
                      : "text-icon-color/80 hover:bg-primary-color/10 hover:text-icon-color"
                  }`}
                >
                  <span
                    className={`flex h-7 w-11 shrink-0 items-center justify-center rounded-full text-lg lg:h-5 lg:w-5 lg:rounded-none lg:bg-transparent lg:text-base ${
                      selected ? "bg-primary-color text-white" : ""
                    }`}
                  >
                    {menu.icon}
                  </span>
                  <span className="line-clamp-2 w-full min-w-0 break-words px-0.5 text-center text-[10px] leading-[1.35] lg:line-clamp-1 lg:text-left lg:text-sm">
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default memo(Sidebar);
