import type { ReactNode } from "react";
import Navbar from "../Navbar";
import React from "react";
import { menuSchoolList } from "../../data";
import { SIDEBAR_CONTENT_OFFSET } from "../sidebar/sidebarLayout";
import SubscriptionExpireBar from "../subscription/SubscriptionExpireBar";

type LayoutProps = {
  children: ReactNode;
  selectMenu: string;
  schoolId: string;
};

function SchoolLayout({ children, selectMenu, schoolId }: LayoutProps) {
  return (
    <section className="min-h-screen max-w-full bg-background-color font-Anuphan">
      <div className="sticky top-0 z-50">
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
          sidebarTrail={[{ kind: "school", id: schoolId }]}
          sidebarDefaultMenu="School"
        />
      </div>
      <div className={SIDEBAR_CONTENT_OFFSET}>{children}</div>
      <SubscriptionExpireBar schoolId={schoolId} />
    </section>
  );
}

export default SchoolLayout;
