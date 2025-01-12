import type { ReactNode } from "react";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import Navbar from "../Navbar";
import { menuClassroomList } from "../../data";

type LayoutProps = {
  children: ReactNode;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
  classroomId: string;
  schoolId: string;
};

function ClassroomLayout({
  children,
  setSelectMenu,
  selectMenu,
  classroomId,
  schoolId,
}: LayoutProps) {
  const navbarRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  // Use the custom hook to detect clicks outside the navbar
  useClickOutside(navbarRef, () => {
    setActive(() => false); // Close the SubjectNavbar when clicking outside
  });
  return (
    <section className="min-h-screen font-Anuphan bg-background-color ">
      <div ref={navbarRef} className="sticky z-50 top-0">
        <Navbar
          menuLists={menuClassroomList({ schoolId: schoolId })}
          schoolId={schoolId}
          setTrigger={setActive}
          trigger={active}
          setSelectMenu={setSelectMenu}
          selectMenu={selectMenu}
        />
      </div>
      {children}
    </section>
  );
}

export default ClassroomLayout;
