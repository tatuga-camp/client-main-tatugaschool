import Image from "next/image";
import { useRouter } from "next/router";
import React, { memo, ReactNode } from "react";
import { defaultBlurHash } from "../data";
import { sidebarDataLanguage } from "../data/languages/sidebar";
import { useGetLanguage, useGetSchool } from "../react-query";
import { decodeBlurhashToCanvas } from "../utils";

type Props = {
  active: boolean;
  schoolId: string;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
  menuList: { title: string; icon: ReactNode; url?: string }[];
};

function Sidebar({
  active,
  schoolId,
  menuList,
  setSelectMenu,
  selectMenu,
}: Props) {
  const language = useGetLanguage();
  const router = useRouter();
  const school = useGetSchool({
    schoolId: schoolId,
  });

  return (
    <div
      className={`flex h-screen flex-col items-center justify-start gap-3 overflow-hidden bg-white text-black transition-width ${
        active ? "w-screen p-5 md:w-60" : "w-0 p-0"
      } `}
    >
      <header className="mt-16 flex h-40 w-full flex-col items-center justify-center gap-1 rounded-lg bg-background-color p-2">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
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
        <h2 className="rounded-md bg-primary-color px-2 text-xs text-white">
          {school.data?.plan}
        </h2>
        <h2 className="text-xs font-semibold">{school.data?.title}</h2>
        <h2 className="text-xs text-gray-600">{school.data?.phoneNumber}</h2>
      </header>

      <ul className="grid w-full gap-2">
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
                  setSelectMenu(menu.title);
                }
              }}
              key={index}
              className={`flex ${
                menu.title === selectMenu && "bg-primary-color text-white"
              } hover:gradient-bg items-center justify-start gap-2 rounded-md p-2 hover:text-white active:bg-primary-color`}
            >
              {menu.icon}
              <span>
                {sidebarDataLanguage[
                  menu.title.toLowerCase() as keyof typeof sidebarDataLanguage
                ](language.data ?? "en")}
              </span>
            </button>
          );
        })}
      </ul>
    </div>
  );
}

export default memo(Sidebar);
