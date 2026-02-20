import { useRef, type ReactNode } from "react";
import Navbar from "../Navbar";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import { menuSchoolList } from "../../data";
import { useGetSchool, useGetUser } from "../../react-query";
import TawkToChat from "../common/TawkToChat";
import { FeedbackTag } from "@/services/feedback";
import FormFeedback from "../feedback/FormFeedback";
import { useCreateFeedback } from "@/react-query/feedback";

type LayoutProps = {
  children: ReactNode;
  selectMenu: string;
  schoolId: string;
};

function SchoolLayout({ children, selectMenu, schoolId }: LayoutProps) {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const school = useGetSchool({ schoolId });
  const user = useGetUser();
  const createFeedback = useCreateFeedback();

  useClickOutside(navbarRef, () => {
    setActive(() => false); // Close the SubjectNavbar when clicking outside
  });

  return (
    <section className="min-h-screen bg-background-color font-Anuphan">
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
      {children}
      <FormFeedback
        onSubmit={(feedback) => {
          createFeedback.mutate({
            title: "User Feedback",
            body: feedback,
            tag: FeedbackTag.COMPLIMENT,
          });
        }}
        onClose={() => {}}
        schoolId="123"
      />
      {school.data && user.data && (
        <TawkToChat school={school.data} user={user.data} />
      )}
    </section>
  );
}

export default SchoolLayout;
