import type { ReactNode } from "react";
import Header from "../Header";
import { UseQueryResult } from "@tanstack/react-query";
import { Subject } from "../../interfaces";
import FooterSubject, { ListMenuFooter } from "../subject/FooterSubject";
import React, { useRef } from "react";
import useClickOutside from "../../hook/useClickOutside";
import Navbar from "../Navbar";
import { menuSubjectList } from "../../data";

type LayoutProps = {
  children: ReactNode;
  subject: UseQueryResult<Subject, Error>;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
  setSelectFooter: React.Dispatch<React.SetStateAction<ListMenuFooter>>;
  selectFooter: ListMenuFooter;
};

function Layout({
  children,
  subject,
  setSelectMenu,
  selectMenu,
  setSelectFooter,
  selectFooter,
}: LayoutProps) {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  // Use the custom hook to detect clicks outside the navbar
  useClickOutside(navbarRef, () => {
    setActive(() => false); // Close the SubjectNavbar when clicking outside
  });
  return (
    <section className="min-h-screen font-Anuphan bg-background-color ">
      <div ref={navbarRef} className="sticky z-50 top-0">
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
      {children}
      <div className="fixed bottom-0 border-t-2 z-40 border-t-gray-200 w-full">
        <FooterSubject
          selectFooter={selectFooter}
          setSelectFooter={setSelectFooter}
        />
      </div>
    </section>
  );
}

export default Layout;
