import React, { memo, ReactNode } from "react";
import { useGetLanguage, useGetSchool, useGetSchools } from "../react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash } from "../data";
import { schoolDataLanguage } from "../data/languages";
import { sidebarDataLanguage } from "../data/languages/sidebar";

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
      className={`text-black overflow-hidden flex flex-col items-center justify-start gap-3
          bg-white  transition-width h-screen ${
            active ? "w-screen md:w-60  p-5" : "w-0 p-0 "
          } `}
    >
      <header
        className=" mt-16 rounded-lg bg-background-color 
      p-2 flex flex-col items-center justify-center gap-1 w-full h-40"
      >
        <div className="w-12 h-12 bg-white rounded-full relative overflow-hidden">
          <Image
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src={school.data?.logo ?? "/favicon.ico"}
            className="object-cover"
            alt={`logo ${school.data?.title}`}
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              school.data?.blurHash ?? defaultBlurHash
            )}
          />
        </div>
        <h2 className="text-xs bg-primary-color px-2 rounded-md text-white">
          {school.data?.plan}
        </h2>
        <h2 className="text-xs font-semibold">{school.data?.title}</h2>
        <h2 className="text-xs text-gray-600">{school.data?.phoneNumber}</h2>
      </header>

      <ul className="grid gap-2 w-full">
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
              } items-center justify-start gap-2 p-2 rounded-md 
             hover:gradient-bg active:bg-primary-color hover:text-white`}
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
