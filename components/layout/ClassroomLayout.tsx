import type { ReactNode } from "react";
import React from "react";
import { menuClassroomList } from "../../data";
import Navbar from "../Navbar";
import { SIDEBAR_CONTENT_OFFSET } from "../sidebar/sidebarLayout";
import { useGetClassroom } from "../../react-query";

type LayoutProps = {
  children: ReactNode;
  classroomId: string;
  schoolId: string;
};

function ClassroomLayout({ children, classroomId, schoolId }: LayoutProps) {
  const classroom = useGetClassroom({
    classId: classroomId,
  });
  return (
    <section className="min-h-screen max-w-full bg-background-color font-Anuphan">
      <div className="sticky top-0 z-50">
        {classroom.data && (
          <Navbar
            menuLists={menuClassroomList()}
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
            sidebarTrail={[
              { kind: "school", id: classroom.data.schoolId },
              { kind: "classroom", id: classroom.data.id },
            ]}
            sidebarDefaultMenu="Classroom"
          />
        )}
      </div>
      <div className={SIDEBAR_CONTENT_OFFSET}>{children}</div>
    </section>
  );
}

export default ClassroomLayout;
