import React, { useState } from "react";
import Stats from "./Stats";
import { MemberOnSchool, School, User } from "@/interfaces";
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
      <main className="bg-gray-50  pb-40 ">
        {members.data && (
          <HeaderSection
            school={school}
            members={members.data}
            onInvite={handleInvite}
          />
        )}
        <Stats schoolId={school.id} />
        <div className="px-12 mt-4 pb-10">
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
