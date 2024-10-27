import { useState } from "react";
import { FC } from "react";
import MemberHeader from "./MemberHeader";
import MemberTable from "./MemberTable";
import { MemberOnSchool, School } from "@/interfaces";
import BasicInformationSection from "./BasicInformationSection";
import MemberSection from "./MemberSection";

export interface TabsMenuSectionProps {
  school: School;
  members: MemberOnSchool[];
  onInvite: () => void;
}

const TabsMenuSection: FC<TabsMenuSectionProps> = ({
  school,
  members,
  onInvite,
}) => {
  const [activeTab, setActiveTab] = useState("Member");

  const tabs = [
    { name: "Member" },
    { name: "Basic information" },
    { name: "Billing & Plan" },
  ];

  return (
    <>
      <div className="flex space-x-8 pb-10 px-10">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`text-gray-600 pb-2 ${
              activeTab === tab.name
                ? "text-primary-color font-semibold border-b-2 border-primary-color px-5"
                : "hover:text-gray-800 px-5"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === "Member" && (
        <MemberSection members={members} onInvite={onInvite} />
      )}
      {activeTab === "Basic information" && (
        <BasicInformationSection school={school} />
      )}
    </>
  );
};

export default TabsMenuSection;
