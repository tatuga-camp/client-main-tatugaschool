import type { ReactNode } from "react";
import React from "react";
import { menuClassroomList } from "../../data";
import useClickOutside from "../../hook/useClickOutside";
import {
  isSidebarPersistent,
  sidebarContentOffsetClass,
  useResponsiveSidebar,
} from "../../hook/useResponsiveSidebar";
import Navbar from "../Navbar";
import { useGetClassroom } from "../../react-query";

type LayoutProps = {
  children: ReactNode;
  classroomId: string;
  schoolId: string;
};

function ClassroomLayout({ children, classroomId, schoolId }: LayoutProps) {
  const navbarRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = useResponsiveSidebar();
  const classroom = useGetClassroom({
    classId: classroomId,
  });
  useClickOutside(navbarRef, () => {
    if (!isSidebarPersistent()) {
      setActive(false);
    }
  });
  return (
    <section className="min-h-screen max-w-full bg-background-color font-Anuphan">
      <div ref={navbarRef} className="sticky top-0 z-50">
        {classroom.data && (
          <Navbar
            menuLists={menuClassroomList({ schoolId: schoolId })}
            schoolId={schoolId}
            breadcrumbs={[
              {
                label: "Home",
                href: `/`,
              },
              {
                label: "School",
                href: `/school/${classroom.data.schoolId}?menu=Classes`,
              },
              {
                label: "Classroom",
                href: `/classroom/${classroom.data.id}`,
              },
            ]}
            setTrigger={setActive}
            trigger={active}
          />
        )}
      </div>
      <div className={sidebarContentOffsetClass(active)}>{children}</div>
    </section>
  );
}

export default ClassroomLayout;
