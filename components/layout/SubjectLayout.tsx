import Link from "next/link";
import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import { MdLock } from "react-icons/md";
import { menuSubjectList } from "../../data";
import { subjectIsLockedDataLanguage } from "../../data/languages/subscription";
import { useGetLanguage, useGetSubject } from "../../react-query";
import Navbar from "../Navbar";
import {
  SIDEBAR_CONTENT_OFFSET,
  SIDEBAR_FIXED_LEFT,
} from "../sidebar/sidebarLayout";
import FooterSubject, { ListMenuFooter } from "../subject/FooterSubject";

type LayoutProps = {
  children: ReactNode;
  subjectId: string;
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  selectFooter: ListMenuFooter;
};

function SubjectLayout({
  children,
  subjectId,
  setSelectFooter,
  selectFooter,
}: LayoutProps) {
  const subject = useGetSubject({
    subjectId,
  });
  const language = useGetLanguage();
  const [triggerShowLock, setTriggerShowLock] = useState(false);
  React.useLayoutEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    if (subject.data && subject.data.isLocked === true) {
      setTriggerShowLock(true);
    }
  }, [subject.isSuccess]);
  return (
    <section className="min-h-screen max-w-full bg-background-color font-Anuphan">
      <div className="sticky top-0 z-40">
        {subject.data && (
          <Navbar
            menuLists={menuSubjectList()}
            breadcrumbs={[
              {
                label: "Home",
                href: `/`,
              },
              {
                label: "School",
                href: `/school/${subject.data.schoolId}?menu=Subjects`,
              },
              {
                label: "Classroom",
                href: `/classroom/${subject.data.classId}`,
              },
              {
                label: "Subject",
                href: `/subject/${subject.data.id}`,
              },
            ]}
            schoolId={subject.data?.schoolId}
            sidebarTrail={[
              { kind: "school", id: subject.data.schoolId },
              { kind: "classroom", id: subject.data.classId },
              { kind: "subject", id: subject.data.id },
            ]}
            sidebarDefaultMenu="Subject"
          />
        )}
      </div>
      {triggerShowLock === true && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-dvh w-screen items-center justify-center bg-gray-400/90">
          <div className="flex max-w-lg flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 text-center shadow-lg sm:p-8">
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
            <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
              <Link
                href={`/school/${subject.data?.schoolId}?menu=Subscription`}
                className="main-button w-full max-w-52"
              >
                {subjectIsLockedDataLanguage.renewButton(language.data ?? "en")}
              </Link>
              <button
                onClick={() => setTriggerShowLock(false)}
                className="second-button w-full max-w-52 border"
              >
                {subjectIsLockedDataLanguage.understandButton(
                  language.data ?? "en",
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={SIDEBAR_CONTENT_OFFSET}>{children}</div>
      <div className={`fixed bottom-0 z-30 bg-white pb-safe ${SIDEBAR_FIXED_LEFT}`}>
        <FooterSubject
          selectFooter={selectFooter}
          setSelectFooter={setSelectFooter}
        />
      </div>
    </section>
  );
}

export default SubjectLayout;
