import type { ReactNode } from "react";
import Header from "../Header";
import { UseQueryResult } from "@tanstack/react-query";
import { Subject } from "../../interfaces";
import FooterSubject, { ListMenuFooter } from "../subject/FooterSubject";
import React, { useEffect, useRef, useState } from "react";
import useClickOutside from "../../hook/useClickOutside";
import Navbar from "../Navbar";
import { menuSubjectList } from "../../data";
import { useGetLanguage, useGetSubject } from "../../react-query";
import { MdLock } from "react-icons/md";
import Link from "next/link";
import { subjectIsLockedDataLanguage } from "../../data/languages/subscription";

type LayoutProps = {
  children: ReactNode;
  subjectId: string;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  selectFooter: ListMenuFooter;
};

function SubjectLayout({
  children,
  subjectId,
  setSelectMenu,
  selectMenu,
  setSelectFooter,
  selectFooter,
}: LayoutProps) {
  const subject = useGetSubject({
    subjectId,
  });
  const navbarRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const language = useGetLanguage();
  const [triggerShowLock, setTriggerShowLock] = useState(false);
  // Use the custom hook to detect clicks outside the navbar
  useClickOutside(navbarRef, () => {
    setActive(() => false); // Close the SubjectNavbar when clicking outside
  });
  React.useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    if (subject.data && subject.data.isLocked === true) {
      setTriggerShowLock(true);
    }
  }, [subject.isSuccess]);
  return (
    <section className="min-h-screen bg-background-color font-Anuphan">
      <div ref={navbarRef} className="sticky top-0 z-50">
        {subject.data && (
          <Navbar
            menuLists={menuSubjectList({ schoolId: subject.data.schoolId })}
            trigger={active}
            setTrigger={setActive}
            setSelectMenu={setSelectMenu}
            selectMenu={selectMenu}
            schoolId={subject.data?.schoolId}
          />
        )}
      </div>
      {triggerShowLock === true && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-dvh w-screen items-center justify-center bg-gray-400/90">
          <div className="flex max-w-lg flex-col items-center justify-center gap-2 rounded-lg bg-white p-8 text-center shadow-lg">
            <MdLock />
            <h2 className="text-2xl font-bold text-gray-800">
              {subjectIsLockedDataLanguage.title(language.data ?? "en")}
            </h2>
            <p className="text-gray-800">
              {subjectIsLockedDataLanguage.description(language.data ?? "en")}
            </p>
            <p className="text-sm text-gray-600">
              {subjectIsLockedDataLanguage.description2(language.data ?? "en")}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              ({subjectIsLockedDataLanguage.toUnlock(language.data ?? "en")})
            </p>
            <div className="flex w-full justify-center gap-2">
              <Link
                href={`/school/${subject.data?.schoolId}?menu=Subscription`}
                className="main-button w-52"
              >
                {subjectIsLockedDataLanguage.renewButton(language.data ?? "en")}
              </Link>
              <button
                onClick={() => setTriggerShowLock(false)}
                className="second-button w-52 border"
              >
                {subjectIsLockedDataLanguage.understandButton(
                  language.data ?? "en",
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
      <div className="fixed bottom-0 z-40 w-full border-t-2 border-t-gray-200">
        <FooterSubject
          selectFooter={selectFooter}
          setSelectFooter={setSelectFooter}
        />
      </div>
    </section>
  );
}

export default SubjectLayout;
