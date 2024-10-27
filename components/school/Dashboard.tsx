import React, { useState } from "react";
import Stats from "./Stats";
import { MemberOnSchool, School, User } from "@/interfaces";
import HeaderSection from "./HeaderSection";
import TabsMenuSection from "./TabsMenuSection";
import InviteJoinSchoolModal from "./InviteJoinSchoolModal";

interface DashboardProps {
  user: User;
  school: School;
  members: MemberOnSchool[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, school, members }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInvite = () => setIsInviteModalOpen(true);
  const handleClose = () => setIsInviteModalOpen(false);

  return (
    <>
      <main className="bg-gray-50 overflow-auto">
        <HeaderSection
          school={school}
          members={members}
          onInvite={handleInvite}
        />
        <Stats />
        <div className="px-12 mt-4 pb-10">
          <TabsMenuSection
            school={school}
            members={members}
            onInvite={handleInvite}
          />
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
