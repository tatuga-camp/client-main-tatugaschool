import type { ReactNode } from "react";
import Header from "../Header";
import SubjectNavbar from "../subject/SubjectNavbar";
import { UseQueryResult } from "@tanstack/react-query";
import { Subject } from "../../interfaces";
import { MenuSubject } from "../subject/SubjectSidebar";
import FooterSubject, { ListMenuFooter } from "../subject/FooterSubject";
import React, { useRef } from "react";
import useClickOutside from "../../hook/useClickOutside";

type LayoutProps = {
  children: ReactNode;
  subject: UseQueryResult<Subject, Error>;
  setSelectMenu: React.Dispatch<React.SetStateAction<MenuSubject>>;
  selectMenu: MenuSubject;
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
      <div className="sticky z-50 top-0" ref={navbarRef}>
        <SubjectNavbar
          active={active}
          setActive={setActive}
          setSelectMenu={setSelectMenu}
          selectMenu={selectMenu}
          subject={subject}
        />
      </div>
      {children}
      <div className="fixed bottom-0 border-t-2  border-t-gray-200 w-full">
        <FooterSubject
          selectFooter={selectFooter}
          setSelectFooter={setSelectFooter}
        />
      </div>
    </section>
  );
}

export default Layout;
