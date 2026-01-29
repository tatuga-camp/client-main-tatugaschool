import type { ReactNode } from "react";
import React from "react";
import { menuClassroomList } from "../../data";
import useClickOutside from "../../hook/useClickOutside";
import Navbar from "../Navbar";
import { useGetClassroom } from "../../react-query";

type LayoutProps = {
  children: ReactNode;
  classroomId: string;
  schoolId: string;
};

function ClassroomLayout({ children, classroomId, schoolId }: LayoutProps) {
  const navbarRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const classroom = useGetClassroom({
    classId: classroomId,
  });
  // Use the custom hook to detect clicks outside the navbar
  useClickOutside(navbarRef, () => {
    setActive(() => false); // Close the SubjectNavbar when clicking outside
  });
  return (
    <section className="min-h-screen bg-background-color font-Anuphan">
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
                href: `/school/${classroom.data.schoolId}/classroom/${classroom.data.id}`,
              },
            ]}
            setTrigger={setActive}
            trigger={active}
          />
        )}
      </div>
      {children}
    </section>
  );
}

export default ClassroomLayout;
