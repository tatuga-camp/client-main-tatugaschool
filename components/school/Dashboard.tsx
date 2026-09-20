import React, { useState } from "react";
import Stats from "./Stats";
import { School } from "@/interfaces";
import HeaderSection from "./HeaderSection";
import TabsMenuSection from "./TabsMenuSection";
import InviteJoinSchoolModal from "./InviteJoinSchoolModal";
import { useGetMemberOnSchoolBySchool } from "../../react-query/memberOnSchool";

interface DashboardProps {
  school: School;
}

const Dashboard: React.FC<DashboardProps> = ({ school }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInvite = () => setIsInviteModalOpen(true);
  const handleClose = () => setIsInviteModalOpen(false);
  const members = useGetMemberOnSchoolBySchool({ schoolId: school.id });
  return (
    <>
      <main className="min-w-0 max-w-full overflow-x-hidden bg-gray-50 pb-40">
        {members.data && (
          <HeaderSection
            school={school}
            members={members.data}
            onInvite={handleInvite}
          />
        )}
        <Stats schoolId={school.id} />
        <div className="mt-4 px-4 pb-10 sm:px-6 md:px-8 xl:px-12 2xl:px-16">
          {members.data && (
            <TabsMenuSection
              school={school}
              members={members.data}
              onInvite={handleInvite}
            />
          )}
        </div>
      </main>
      <InviteJoinSchoolModal
        isOpen={isInviteModalOpen}
        onClose={handleClose}
        schoolId={school.id}
      />
    </>
  );
};

export default Dashboard;
