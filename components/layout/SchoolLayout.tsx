import { useRef, type ReactNode } from "react";
import Navbar from "../Navbar";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import { menuSchoolList } from "../../data";
import { useGetSchool, useGetUser } from "../../react-query";
import TawkToChat from "../common/TawkToChat";

type LayoutProps = {
  children: ReactNode;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
  schoolId: string;
};

function SchoolLayout({
  children,
  setSelectMenu,
  selectMenu,
  schoolId,
}: LayoutProps) {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const school = useGetSchool({ schoolId });
  const user = useGetUser();
  useClickOutside(navbarRef, () => {
    setActive(() => false); // Close the SubjectNavbar when clicking outside
  });
  return (
    <section className="min-h-screen bg-background-color font-Anuphan">
      <div ref={navbarRef} className="sticky top-0 z-50">
        <Navbar
          menuLists={menuSchoolList()}
          schoolId={schoolId}
          setTrigger={setActive}
          trigger={active}
          setSelectMenu={setSelectMenu}
          selectMenu={selectMenu}
        />
      </div>
      {children}
      {school.data && user.data && (
        <TawkToChat school={school.data} user={user.data} />
      )}
    </section>
  );
}

export default SchoolLayout;
