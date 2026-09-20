import { useRef, type ReactNode } from "react";
import Navbar from "../Navbar";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import {
  isSidebarPersistent,
  sidebarContentOffsetClass,
  useResponsiveSidebar,
} from "../../hook/useResponsiveSidebar";
import { menuSchoolList } from "../../data";
import SubscriptionExpireBar from "../subscription/SubscriptionExpireBar";

type LayoutProps = {
  children: ReactNode;
  selectMenu: string;
  schoolId: string;
};

function SchoolLayout({ children, selectMenu, schoolId }: LayoutProps) {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useResponsiveSidebar();
  useClickOutside(navbarRef, () => {
    if (!isSidebarPersistent()) {
      setActive(false);
    }
  });

  return (
    <section className="min-h-screen max-w-full bg-background-color font-Anuphan">
      <div ref={navbarRef} className="sticky top-0 z-50">
        <Navbar
          menuLists={menuSchoolList()}
          schoolId={schoolId}
          breadcrumbs={[
            {
              label: "Home",
              href: `/`,
            },
            {
              label: "School",
              href: `/school/${schoolId}`,
            },
          ]}
          setTrigger={setActive}
          trigger={active}
        />
      </div>
      <div className={sidebarContentOffsetClass(active)}>{children}</div>
      <SubscriptionExpireBar schoolId={schoolId} />
    </section>
  );
}

export default SchoolLayout;
